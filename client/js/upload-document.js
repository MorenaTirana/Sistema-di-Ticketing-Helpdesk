const documentForm =
    document.getElementById("documentForm");

const ticketIdInput =
    document.getElementById("ticketId");

const documentType =
    document.getElementById("documentType");

const ricSelect =
    document.getElementById("ricId");

const documentSeries =
    document.getElementById("documentSeries");

const documentDate =
    document.getElementById("documentDate");

const documentFile =
    document.getElementById("documentFile");

const visibilityNotice =
    document.getElementById("visibilityNotice");

const backToTicketLink =
    document.getElementById("backToTicketLink");

const message =
    document.getElementById("message");

let currentTicketId = null;

const documentiVisibili = [
    "preventivo",
    "proforma",
    "ddt_cliente",
    "documento_corriere",
    "conferma_pagamento"
];

function impostaDataCorrente() {
    const oggi = new Date();

    const anno = oggi.getFullYear();

    const mese = String(
        oggi.getMonth() + 1
    ).padStart(2, "0");

    const giorno = String(
        oggi.getDate()
    ).padStart(2, "0");

    documentDate.value =
        `${anno}-${mese}-${giorno}`;
}

function aggiornaAvvisoVisibilita() {
    const tipo = documentType.value;

    if (!tipo) {
        visibilityNotice.innerHTML = `
            <strong>Seleziona il tipo di documento</strong>
            <p>
                Ti indicheremo se sarà visibile al cliente.
            </p>
        `;

        return;
    }

    const visibile = documentiVisibili.includes(tipo);

    if (visibile) {
        visibilityNotice.innerHTML = `
            <strong>Documento visibile al cliente</strong>
            <p>
                Il cliente potrà visualizzare e scaricare
                questo documento dal proprio ticket.
            </p>
        `;

        visibilityNotice.className =
            "document-notice document-notice-public";
    } else {
        visibilityNotice.innerHTML = `
            <strong>Documento interno</strong>
            <p>
                Il documento sarà accessibile esclusivamente
                agli operatori.
            </p>
        `;

        visibilityNotice.className = "document-notice";
    }

    if (
        tipo === "proforma" &&
        !documentSeries.value
    ) {
        documentSeries.value = "PRF";
    }

    if (
        tipo === "ddt_cliente" &&
        documentSeries.value === "PRF"
    ) {
        documentSeries.value = "";
    }
}

async function caricaRics() {
    const response = await fetch(
        `/api/ric/ticket/${currentTicketId}`
    );

    const risultato = await response.json();

    if (!response.ok) {
        throw new Error(risultato.message);
    }

    risultato.rics.forEach((ric) => {
        const option = document.createElement("option");

        option.value = ric.id;
        option.textContent =
            `RIC ${ric.numero_ric} - ${ric.riferimento}`;

        ricSelect.appendChild(option);
    });
}

async function inizializzaPagina() {
    const parametri =
        new URLSearchParams(window.location.search);

    currentTicketId = parametri.get("ticket_id");

    if (!currentTicketId) {
        documentForm.hidden = true;

        message.textContent =
            "Identificativo del ticket mancante";

        message.className =
            "form-message error-message";

        return;
    }

    ticketIdInput.value = currentTicketId;

    backToTicketLink.href =
        `ticket-detail.html?id=${currentTicketId}`;

    try {
        const userResponse = await fetch("/api/auth/me");
        const userResult = await userResponse.json();

        if (!userResponse.ok) {
            window.location.href = "login.html";
            return;
        }

        if (userResult.utente.ruolo !== "operatore") {
            window.location.href = "dashboard.html";
            return;
        }

        const ticketResponse = await fetch(
            `/api/tickets/${currentTicketId}`
        );

        const ticketResult = await ticketResponse.json();

        if (!ticketResponse.ok) {
            throw new Error(ticketResult.message);
        }

        await caricaRics();
    } catch (error) {
        documentForm.hidden = true;

        message.textContent = error.message;
        message.className =
            "form-message error-message";
    }
}

documentType.addEventListener(
    "change",
    aggiornaAvvisoVisibilita
);

documentForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const file = documentFile.files[0];

        if (!file) {
            message.textContent =
                "Seleziona il documento PDF";

            message.className =
                "form-message error-message";

            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            message.textContent =
                "Il PDF supera la dimensione massima di 10 MB";

            message.className =
                "form-message error-message";

            return;
        }

        message.textContent =
            "Caricamento del documento in corso...";

        message.className = "form-message";

        const datiDocumento =
            new FormData(documentForm);

        try {
            const response = await fetch(
                "/api/documents",
                {
                    method: "POST",
                    body: datiDocumento
                }
            );

            const risultato = await response.json();

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            if (!response.ok) {
                throw new Error(risultato.message);
            }

            const visibilita =
                risultato.documento.visibile_cliente
                    ? "Visibile al cliente."
                    : "Documento interno.";

            message.textContent =
                `Documento caricato correttamente. ${visibilita}`;

            message.className =
                "form-message success-message";

            documentFile.value = "";
        } catch (error) {
            message.textContent = error.message;

            message.className =
                "form-message error-message";
        }
    }
);

impostaDataCorrente();
inizializzaPagina();