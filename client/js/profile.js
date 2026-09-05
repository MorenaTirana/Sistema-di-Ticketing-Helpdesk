const profileForm =
    document.getElementById("profileForm");

const profileMessage =
    document.getElementById("profileMessage");

const logoutButton =
    document.getElementById("logoutButton");

const ticketHistoryList =
    document.getElementById("ticketHistoryList");

const ticketHistoryMessage =
    document.getElementById("ticketHistoryMessage");


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


let currentUser = null;


function formatDate(data) {
    if (!data) {
        return "Data non disponibile";
    }

    return new Date(data).toLocaleDateString(
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


function createTicketInformation(
    label,
    value
) {
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
        `/api/tickets/attachments/${attachmentId}/view`;

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

    placeholder.textContent =
        "Anteprima non disponibile";

    preview.appendChild(placeholder);

    return preview;
}


function showTicketHistory(tickets) {
    ticketHistoryList.innerHTML = "";

    const ticketsCliente =
        tickets.filter((ticket) => {
            const appartieneAlCliente =
                Number(ticket.utente_id) ===
                Number(currentUser.id);

            const haBarcaAssociata =
                Boolean(ticket.barca_id);

            return (
                appartieneAlCliente &&
                haBarcaAssociata
            );
        });

    if (ticketsCliente.length === 0) {
        const messaggio =
            document.createElement("p");

        messaggio.className =
            "empty-message";

        messaggio.textContent =
            "Non risultano ticket collegati alle tue barche.";

        ticketHistoryList.appendChild(
            messaggio
        );

        return;
    }

    const lista =
        document.createElement("div");

    lista.className =
        "profile-ticket-results";

    ticketsCliente.forEach((ticket) => {
        const card =
            document.createElement("article");

        card.className =
            `profile-ticket-row profile-ticket-row-${ticket.stato}`;

        const preview =
            createTicketPreview(ticket);

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

        intestazione.appendChild(
            numeroTicket
        );

        intestazione.appendChild(
            stato
        );

        const titolo =
            document.createElement("h3");

        titolo.textContent =
            ticket.titolo ||
            "Ticket senza titolo";

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

        const modello =
            ticket.barca_modello ||
            "Modello non disponibile";

        const matricola =
            ticket.barca_matricola ||
            "Matricola non disponibile";

        barcaValue.textContent =
            `${modello} — ${matricola}`;

        barca.appendChild(barcaLabel);
        barca.appendChild(barcaValue);

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

        contenuto.appendChild(
            intestazione
        );

        contenuto.appendChild(titolo);
        contenuto.appendChild(barca);
        contenuto.appendChild(informazioni);

        const azioni =
            document.createElement("div");

        azioni.className =
            "profile-ticket-actions";

        const dettaglioLink =
            document.createElement("a");

        dettaglioLink.className =
            "button button-primary profile-ticket-detail-link";

        dettaglioLink.href =
            `ticket-detail.html?id=${encodeURIComponent(
                ticket.id
            )}`;

        dettaglioLink.textContent =
            "Visualizza dettaglio";

        azioni.appendChild(
            dettaglioLink
        );

        card.appendChild(preview);
        card.appendChild(contenuto);
        card.appendChild(azioni);

        lista.appendChild(card);
    });

    ticketHistoryList.appendChild(lista);
}

async function loadProfile() {
    try {
        const response =
            await fetch("/api/auth/me");

        const risultato =
            await response.json();

        if (response.status === 401) {
            window.location.href =
                "login.html";

            return false;
        }

        if (!response.ok) {
            throw new Error(
                risultato.message
            );
        }

        currentUser =
            risultato.utente;

        document.getElementById("nome").value =
            currentUser.nome ?? "";

        document.getElementById("cognome").value =
            currentUser.cognome ?? "";

        document.getElementById("email").value =
            currentUser.email ?? "";

        document.getElementById("telefono").value =
            currentUser.telefono ?? "";

        document.getElementById(
            "indirizzoResidenza"
        ).value =
            currentUser.indirizzo_residenza ?? "";

        return true;
    } catch (error) {
        profileMessage.textContent =
            messaggioErrore(error);

        profileMessage.className =
            "form-message error-message";

        return false;
    }
}

function messaggioErrore(error) {
    if (error instanceof TypeError) {
        return "Impossibile contattare il server. Controlla la connessione e riprova.";
    }

    return error.message;
}


async function loadTicketHistory() {
    ticketHistoryList.innerHTML =
        "<p>Caricamento dello storico...</p>";

    ticketHistoryMessage.textContent = "";
    ticketHistoryMessage.className =
        "form-message";

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
                risultato.message
            );
        }

        const tickets =
            risultato.ticket ??
            [];

        showTicketHistory(tickets);
    } catch (error) {
        ticketHistoryList.innerHTML = "";

        ticketHistoryMessage.textContent =
            messaggioErrore(error);

        ticketHistoryMessage.className =
            "form-message error-message";
    }
}


profileForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        profileMessage.textContent =
            "Salvataggio dei dati in corso...";

        profileMessage.className =
            "form-message";

        const datiProfilo = {
            nome:
                document.getElementById(
                    "nome"
                ).value.trim(),

            cognome:
                document.getElementById(
                    "cognome"
                ).value.trim(),

            email:
                document.getElementById(
                    "email"
                ).value.trim(),

            telefono:
                document.getElementById(
                    "telefono"
                ).value.trim(),

            indirizzo_residenza:
                document.getElementById(
                    "indirizzoResidenza"
                ).value.trim()
        };

        try {
            const response =
                await fetch(
                    "/api/auth/profile",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                datiProfilo
                            )
                    }
                );

            const risultato =
                await response.json();

            if (response.status === 401) {
                window.location.href =
                    "login.html";

                return;
            }

            if (!response.ok) {
                throw new Error(
                    risultato.message
                );
            }

            currentUser =
                risultato.utente;

            profileMessage.textContent =
                risultato.message;

            profileMessage.className =
                "form-message success-message";
        } catch (error) {
            profileMessage.textContent =
                messaggioErrore(error);

            profileMessage.className =
                "form-message error-message";
        }
    }
);


logoutButton.addEventListener(
    "click",
    async () => {
        try {
            const response =
                await fetch(
                    "/api/auth/logout",
                    {
                        method: "POST"
                    }
                );

            if (!response.ok) {
                const risultato =
                    await response.json();

                throw new Error(
                    risultato.message
                );
            }

            window.location.href =
                "login.html";
        } catch (error) {
            profileMessage.textContent =
                messaggioErrore(error);

            profileMessage.className =
                "form-message error-message";
        }
    }
);


async function initializeProfile() {
    const profiloCaricato =
        await loadProfile();

    if (!profiloCaricato) {
        return;
    }

    await loadTicketHistory();
}


initializeProfile();