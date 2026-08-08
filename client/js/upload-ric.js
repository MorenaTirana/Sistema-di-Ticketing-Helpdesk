const ricForm = document.getElementById("ricForm");
const ticketIdInput = document.getElementById("ticketId");
const numeroRicInput = document.getElementById("numeroRic");
const destinatarioInput =
    document.getElementById("destinatario");
const riferimentoInput =
    document.getElementById("riferimento");
const dataRicInput = document.getElementById("dataRic");
const documentoInput = document.getElementById("documento");
const backToTicketLink =
    document.getElementById("backToTicketLink");
const message = document.getElementById("message");

let currentTicketId = null;

function impostaDataCorrente() {
    const oggi = new Date();
    const anno = oggi.getFullYear();
    const mese = String(oggi.getMonth() + 1).padStart(2, "0");
    const giorno = String(oggi.getDate()).padStart(2, "0");

    dataRicInput.value = `${anno}-${mese}-${giorno}`;
}

async function inizializzaPagina() {
    const parametri =
        new URLSearchParams(window.location.search);

    currentTicketId = parametri.get("ticket_id");

    if (!currentTicketId) {
        ricForm.hidden = true;

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
        // Verifica autenticazione e ruolo.
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

        // Recupera i dati del ticket.
        const ticketResponse = await fetch(
            `/api/tickets/${currentTicketId}`
        );

        const ticketResult = await ticketResponse.json();

        if (!ticketResponse.ok) {
            throw new Error(ticketResult.message);
        }

        const ticket = ticketResult.ticket;

        destinatarioInput.value =
            `${ticket.utente_nome} ${ticket.utente_cognome}`;

        const riferimentoBarca =
            ticket.barca_modello || "barca non specificata";

        riferimentoInput.value =
            `Ric. ${riferimentoBarca}`;
    } catch (error) {
        ricForm.hidden = true;

        message.textContent = error.message;
        message.className =
            "form-message error-message";
    }
}

ricForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "Caricamento del RIC in corso...";
    message.className = "form-message";

    const file = documentoInput.files[0];

    if (!file) {
        message.textContent = "Seleziona il PDF del RIC";
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

    const datiRic = new FormData(ricForm);

    try {
        const response = await fetch("/api/ric", {
            method: "POST",
            body: datiRic
        });

        const risultato = await response.json();

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        message.textContent =
            `RIC ${risultato.ric.numero_ric} caricato correttamente`;

        message.className =
            "form-message success-message";

        numeroRicInput.value = "";
        documentoInput.value = "";
    } catch (error) {
        message.textContent = error.message;
        message.className =
            "form-message error-message";
    }
});

impostaDataCorrente();
inizializzaPagina();