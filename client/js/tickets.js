function messaggioErrore(error) {
    if (error instanceof TypeError) {
        return "Impossibile contattare il server. Controlla la connessione e riprova.";
    }

    return error.message;
}

const ticketList =
    document.getElementById("ticketList");

const message =
    document.getElementById("message");

const ticketSearch =
    document.getElementById("ticketSearch");

const statusFilter =
    document.getElementById("statusFilter");

const priorityFilter =
    document.getElementById("priorityFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const operatorFilter =
    document.getElementById("operatorFilter");

const resetFilters =
    document.getElementById("resetFilters");

const ticketResultCount =
    document.getElementById("ticketResultCount");

let allTickets = [];

const categorie = {
    problema_tecnico: "Problema tecnico",
    accesso_account: "Accesso account",
    fatturazione: "Fatturazione",
    informazioni: "Informazioni",
    altro: "Altro"
};

const stati = {
    aperto: "Aperto",
    in_lavorazione: "In lavorazione",
    risolto: "Risolto",
    chiuso: "Chiuso"
};

const priorita = {
    bassa: "Bassa",
    media: "Media",
    alta: "Alta",
    urgente: "Urgente"
};

function formatDate(data) {
    if (!data) {
        return "Data non disponibile";
    }

    return new Date(data).toLocaleString(
        "it-IT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function createTicketInformation(label, value) {
    const container =
        document.createElement("div");

    const etichetta =
        document.createElement("dt");

    etichetta.textContent = label;

    const contenuto =
        document.createElement("dd");

    contenuto.textContent = value;

    container.appendChild(etichetta);
    container.appendChild(contenuto);

    return container;
}

function createTicketPreview(ticket) {
    const preview =
        document.createElement("div");

    preview.className =
        "profile-ticket-preview";

    const attachmentId =
        ticket.allegato_anteprima_id;

    const attachmentType =
        ticket.allegato_anteprima_tipo;

    const attachmentMime =
        ticket.allegato_anteprima_mime;

    const attachmentName =
        ticket.allegato_anteprima_nome ||
        `Allegato del ticket ${ticket.id}`;

    if (!attachmentId) {
        const placeholder =
            document.createElement("div");

        placeholder.className =
            "profile-ticket-preview-placeholder";

        const simbolo =
            document.createElement("span");

        simbolo.className =
            "profile-ticket-preview-symbol";

        simbolo.textContent = "⚓";

        const testo =
            document.createElement("span");

        testo.textContent =
            "Nessuna foto o video";

        placeholder.appendChild(simbolo);
        placeholder.appendChild(testo);
        preview.appendChild(placeholder);

        return preview;
    }

    const attachmentUrl =
        `/api/tickets/attachments/` +
        `${attachmentId}/view`;

    if (attachmentType === "foto") {
        const immagine =
            document.createElement("img");

        immagine.src = attachmentUrl;
        immagine.alt = attachmentName;
        immagine.loading = "lazy";

        preview.appendChild(immagine);

        return preview;
    }

    if (attachmentType === "video") {
        const video =
            document.createElement("video");

        video.controls = true;
        video.preload = "metadata";
        video.playsInline = true;

        const sorgente =
            document.createElement("source");

        sorgente.src = attachmentUrl;

        if (attachmentMime) {
            sorgente.type = attachmentMime;
        }

        video.appendChild(sorgente);
        preview.appendChild(video);

        return preview;
    }

    const placeholder =
        document.createElement("div");

    placeholder.className =
        "profile-ticket-preview-placeholder";

    const simbolo =
        document.createElement("span");

    simbolo.className =
        "profile-ticket-preview-symbol";

    simbolo.textContent = "⚓";

    const testo =
        document.createElement("span");

    testo.textContent =
        "Anteprima non disponibile";

    placeholder.appendChild(simbolo);
    placeholder.appendChild(testo);
    preview.appendChild(placeholder);

    return preview;
}

function normalizeText(value) {
    return String(value ?? "")
        .toLocaleLowerCase("it-IT")
        .trim();
}

function populateOperatorFilter(tickets) {
    const operators = new Map();

    tickets.forEach((ticket) => {
        if (!ticket.operatore_id) {
            return;
        }

        const fullName =
            `${ticket.operatore_nome ?? ""} ` +
            `${ticket.operatore_cognome ?? ""}`;

        operators.set(
            String(ticket.operatore_id),
            fullName.trim() ||
            `Operatore ${ticket.operatore_id}`
        );
    });

    [...operators.entries()]
        .sort((first, second) =>
            first[1].localeCompare(second[1], "it")
        )
        .forEach(([id, name]) => {
            const option =
                document.createElement("option");

            option.value = id;
            option.textContent = name;

            operatorFilter.appendChild(option);
        });
}

function applyTicketFilters() {
    const searchValue =
        normalizeText(ticketSearch.value);

    const statusValue =
        statusFilter.value;

    const priorityValue =
        priorityFilter.value;

    const categoryValue =
        categoryFilter.value;

    const operatorValue =
        operatorFilter.value;

    const filteredTickets =
        allTickets.filter((ticket) => {
            const searchableText =
                normalizeText([
                    ticket.titolo,
                    ticket.barca_modello,
                    ticket.barca_matricola,
                    ticket.utente_nome,
                    ticket.utente_cognome
                ].join(" "));

            const isTicketNumber =
                /^\d+$/.test(searchValue);

            const matchesSearch =
                !searchValue ||
                (
                    isTicketNumber
                        ? String(ticket.id) === searchValue
                        : searchableText.includes(searchValue)
                );

            const matchesStatus =
                !statusValue ||
                ticket.stato === statusValue;

            const matchesPriority =
                !priorityValue ||
                ticket.priorita === priorityValue;

            const matchesCategory =
                !categoryValue ||
                ticket.categoria === categoryValue;

            let matchesOperator = true;

            if (operatorValue === "non_assegnato") {
                matchesOperator =
                    !ticket.operatore_id;
            } else if (operatorValue) {
                matchesOperator =
                    String(ticket.operatore_id) ===
                    operatorValue;
            }

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesCategory &&
                matchesOperator
            );
        });

    const numberOfTickets =
        filteredTickets.length;

    ticketResultCount.textContent =
        numberOfTickets === 1
            ? "1 ticket trovato"
            : `${numberOfTickets} ticket trovati`;

    showTickets(filteredTickets);
}

function clearTicketFilters() {
    ticketSearch.value = "";
    statusFilter.value = "";
    priorityFilter.value = "";
    categoryFilter.value = "";
    operatorFilter.value = "";

    applyTicketFilters();
}

function showTickets(tickets) {
    ticketList.innerHTML = "";

    if (!Array.isArray(tickets) || tickets.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state">
                <h2>Nessun ticket presente</h2>

                <p>
                    Non hai ancora aperto richieste
                    di assistenza.
                </p>
            </div>
        `;

        return;
    }

    const lista =
        document.createElement("div");

    lista.className =
        "profile-ticket-results";

    tickets.forEach((ticket) => {
        const card =
            document.createElement("article");

        card.className =
            `profile-ticket-row ` +
            `profile-ticket-row-${ticket.stato}`;

        /*
         * Colonna sinistra:
         * anteprima foto o video
         */
        const preview =
            createTicketPreview(ticket);

        /*
         * Colonna centrale:
         * informazioni del ticket
         */
        const contenuto =
            document.createElement("div");

        contenuto.className =
            "profile-ticket-content";

        const intestazione =
            document.createElement("div");

        intestazione.className =
            "profile-ticket-heading";

        const numeroTicket =
            document.createElement("span");

        numeroTicket.className =
            "profile-ticket-number";

        numeroTicket.textContent =
            `Ticket #${ticket.id}`;

        const stato =
            document.createElement("span");

        stato.className =
            `ticket-status status-${ticket.stato}`;

        stato.textContent =
            stati[ticket.stato] ??
            "Stato non disponibile";

        intestazione.appendChild(numeroTicket);
        intestazione.appendChild(stato);

        const titolo =
            document.createElement("h3");

        titolo.textContent =
            ticket.titolo ||
            "Ticket senza titolo";

        /*
         * Informazioni della barca
         */
        const barca =
            document.createElement("div");

        barca.className =
            "profile-ticket-boat";

        const barcaLabel =
            document.createElement("span");

        barcaLabel.textContent =
            "Imbarcazione";

        const barcaValue =
            document.createElement("strong");

        if (ticket.barca_id) {
            const modello =
                ticket.barca_modello ||
                "Modello non disponibile";

            const matricola =
                ticket.barca_matricola ||
                "Matricola non disponibile";

            barcaValue.textContent =
                `${modello} — ${matricola}`;
        } else {
            barcaValue.textContent =
                "Barca non associata";
        }

        barca.appendChild(barcaLabel);
        barca.appendChild(barcaValue);

        /*
         * Categoria, priorità e data
         */
        const informazioni =
            document.createElement("dl");

        informazioni.className =
            "profile-ticket-information";

        informazioni.appendChild(
            createTicketInformation(
                "Categoria",
                categorie[ticket.categoria] ??
                "Non indicata"
            )
        );

        informazioni.appendChild(
            createTicketInformation(
                "Priorità",
                priorita[ticket.priorita] ??
                "Media"
            )
        );

        informazioni.appendChild(
            createTicketInformation(
                "Data di apertura",
                formatDate(ticket.created_at)
            )
        );

        contenuto.appendChild(intestazione);
        contenuto.appendChild(titolo);
        contenuto.appendChild(barca);
        contenuto.appendChild(informazioni);

        /*
         * Colonna destra:
         * pulsante del dettaglio
         */
        const azioni =
            document.createElement("div");

        azioni.className =
            "profile-ticket-actions";

        const dettaglioLink =
            document.createElement("a");

        dettaglioLink.className =
            "button button-primary " +
            "profile-ticket-detail-link";

        dettaglioLink.href =
            `ticket-detail.html?id=` +
            `${encodeURIComponent(ticket.id)}`;

        dettaglioLink.textContent =
            "Visualizza dettaglio";

        azioni.appendChild(dettaglioLink);

        card.appendChild(preview);
        card.appendChild(contenuto);
        card.appendChild(azioni);

        lista.appendChild(card);
    });

    ticketList.appendChild(lista);
}

function createConsultationsSection() {
    let section =
        document.getElementById("receivedConsultations");

    if (section) {
        return section;
    }

    section = document.createElement("section");
    section.id = "receivedConsultations";
    section.className = "received-consultations-section";

    ticketList.parentNode.insertBefore(
        section,
        ticketList
    );

    return section;
}

function showMyConsultations(consultations) {
    const section = createConsultationsSection();

    section.innerHTML = "";

    if (
        !Array.isArray(consultations) ||
        consultations.length === 0
    ) {
        section.remove();
        return;
    }

    const title = document.createElement("h2");
    title.textContent = "Richieste di consultazione";

    section.appendChild(title);

    const list = document.createElement("div");
    list.className = "consultation-dashboard-list";

    consultations.forEach((consultation) => {
        const card = document.createElement("a");

        card.className =
            "consultation-dashboard-card";

        card.href =
            `ticket-detail.html?id=${encodeURIComponent(
                consultation.ticket_id
            )}`;

        const heading =
            document.createElement("div");

        heading.className =
            "consultation-dashboard-heading";

        const ticketNumber =
            document.createElement("strong");

        ticketNumber.textContent =
            `Ticket #${consultation.ticket_id}`;


        heading.appendChild(ticketNumber);

        const ticketTitle =
            document.createElement("h3");

        ticketTitle.textContent =
            consultation.ticket_titolo ||
            "Ticket senza titolo";

        const request =
            document.createElement("p");

        request.textContent =
            consultation.richiesta;

        const requester =
            document.createElement("small");

        requester.className =
            "consultation-dashboard-requester";

        const requesterLabel =
            document.createElement("span");

        requesterLabel.className =
            "consultation-dashboard-requester-label";

        requesterLabel.textContent =
            "Richiesta da: ";

        const requesterName =
            document.createElement("strong");

        requesterName.className =
            "consultation-dashboard-requester-name";

        requesterName.textContent =
            `${consultation.richiedente_nome} ` +
            `${consultation.richiedente_cognome}`;

        requester.appendChild(requesterLabel);
        requester.appendChild(requesterName);

        card.appendChild(heading);
        card.appendChild(ticketTitle);
        card.appendChild(request);
        card.appendChild(requester);

        list.appendChild(card);
    });

    section.appendChild(list);
}

async function loadMyConsultations() {
    try {
        const response =
            await fetch(
                "/api/tickets/consultations/mine"
            );

        /*
         * Un cliente normale non può ricevere
         * consultazioni: in quel caso non mostriamo nulla.
         */
        if (
            response.status === 401 ||
            response.status === 403
        ) {
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Impossibile caricare le consultazioni"
            );
        }

        showMyConsultations(
            result.consultazioni
        );
    } catch (error) {
        console.error(
            "Errore caricamento consultazioni:",
            error
        );
    }
}

async function loadTickets() {
    ticketList.innerHTML =
        "<p>Caricamento dei ticket...</p>";

    message.textContent = "";
    message.className = "form-message";

    try {
        const response =
            await fetch("/api/tickets");

        const risultato =
            await response.json();

        if (response.status === 401) {
            window.location.href =
                "login.html";

            return;
        }

        if (!response.ok) {
            throw new Error(
                risultato.message ||
                "Impossibile caricare i ticket"
            );
        }

        allTickets =
            Array.isArray(risultato.ticket)
                ? risultato.ticket
                : [];

        populateOperatorFilter(allTickets);
        applyTicketFilters();
    } catch (error) {
        ticketList.innerHTML = "";

        message.textContent =
            messaggioErrore(error);

        message.className =
            "form-message error-message";
    }
}

ticketSearch.addEventListener(
    "input",
    applyTicketFilters
);

[
    statusFilter,
    priorityFilter,
    categoryFilter,
    operatorFilter
].forEach((filter) => {
    filter.addEventListener(
        "change",
        applyTicketFilters
    );
});

resetFilters.addEventListener(
    "click",
    clearTicketFilters
);
loadMyConsultations();
loadTickets();