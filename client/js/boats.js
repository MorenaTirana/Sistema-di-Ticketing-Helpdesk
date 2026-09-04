const boatsList =
    document.getElementById("boatsList");

const boatMessage =
    document.getElementById("boatMessage");

const logoutButton =
    document.getElementById("logoutButton");

const pageTitle =
    document.getElementById("pageTitle");

const pageDescription =
    document.getElementById("pageDescription");

const stati = {
    aperto: "Aperto",
    in_lavorazione: "In lavorazione",
    risolto: "Risolto",
    chiuso: "Chiuso"
};

const categorie = {
    problema_tecnico: "Problema tecnico",
    accesso_account: "Accesso account",
    fatturazione: "Fatturazione",
    informazioni: "Informazioni",
    altro: "Altro"
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

function formatDateOnly(data) {
    if (!data) {
        return "Non indicata";
    }

    return new Date(data).toLocaleDateString(
        "it-IT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC"
        }
    );
}

function getWarrantyStatus(barca) {
    if (!barca.garanzia_scadenza_il) {
        return {
            testo: "Fuori garanzia",
            classe: "warranty-expired",
            attiva: false
        };
    }

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const scadenza =
        new Date(barca.garanzia_scadenza_il);

    scadenza.setHours(0, 0, 0, 0);

    if (scadenza >= oggi) {
        return {
            testo: "In garanzia",
            classe: "warranty-active",
            attiva: true
        };
    }

    return {
        testo: "Fuori garanzia",
        classe: "warranty-expired",
        attiva: false
    };
}

function createDetail(label, value) {
    const elemento =
        document.createElement("div");

    const etichetta =
        document.createElement("dt");

    etichetta.textContent = label;

    const contenuto =
        document.createElement("dd");

    contenuto.textContent =
        value || "Non disponibile";

    elemento.appendChild(etichetta);
    elemento.appendChild(contenuto);

    return elemento;
}

function createTicketCard(ticket) {
    const card =
        document.createElement("article");

    card.className =
        `boat-ticket-card boat-ticket-${ticket.stato}`;

    const contenuto =
        document.createElement("div");

    contenuto.className =
        "boat-ticket-content";

    const intestazione =
        document.createElement("div");

    intestazione.className =
        "boat-ticket-heading";

    const numero =
        document.createElement("span");

    numero.className =
        "boat-ticket-number";

    numero.textContent =
        `Ticket #${ticket.id}`;

    const stato =
        document.createElement("span");

    stato.className =
        `ticket-status status-${ticket.stato}`;

    stato.textContent =
        stati[ticket.stato] ||
        ticket.stato ||
        "Stato non disponibile";

    intestazione.appendChild(numero);
    intestazione.appendChild(stato);

    const titolo =
        document.createElement("h4");

    titolo.textContent =
        ticket.titolo ||
        "Ticket senza titolo";

    const informazioni =
        document.createElement("dl");

    informazioni.className =
        "boat-ticket-information";

    informazioni.appendChild(
        createDetail(
            "Categoria",
            categorie[ticket.categoria] ||
            "Non indicata"
        )
    );

    informazioni.appendChild(
        createDetail(
            "Priorità",
            priorita[ticket.priorita] ||
            "Media"
        )
    );

    informazioni.appendChild(
        createDetail(
            "Data di apertura",
            formatDate(ticket.created_at)
        )
    );

    contenuto.appendChild(intestazione);
    contenuto.appendChild(titolo);
    contenuto.appendChild(informazioni);

    const azioni =
        document.createElement("div");

    azioni.className =
        "boat-ticket-actions";

    const collegamento =
        document.createElement("a");

    collegamento.className =
        "button button-primary button-small";

    collegamento.href =
        `ticket-detail.html?id=${encodeURIComponent(
            ticket.id
        )}`;

    collegamento.textContent =
        "Visualizza dettaglio";

    azioni.appendChild(collegamento);

    card.appendChild(contenuto);
    card.appendChild(azioni);

    return card;
}

function createBoatCard(barca, tickets) {
    const card =
        document.createElement("article");

    card.className =
        "registered-boat-card";

    const header =
        document.createElement("div");

    header.className =
        "registered-boat-header";

    const identificazione =
        document.createElement("div");

    const etichetta =
        document.createElement("span");

    etichetta.className =
        "registered-boat-label";

    etichetta.textContent =
        "Imbarcazione";

    const titolo =
        document.createElement("h3");

    titolo.textContent =
        barca.modello ||
        "Modello non disponibile";

    const matricola =
        document.createElement("p");

    matricola.textContent =
        barca.matricola ||
        "Matricola non disponibile";

    identificazione.appendChild(etichetta);
    identificazione.appendChild(titolo);
    identificazione.appendChild(matricola);

    const statoGaranzia =
        getWarrantyStatus(barca);

    const badge =
        document.createElement("span");

    badge.className =
        `warranty-badge ${statoGaranzia.classe}`;

    badge.textContent =
        statoGaranzia.testo;

    header.appendChild(identificazione);
    header.appendChild(badge);

    const dettagli =
        document.createElement("dl");

    dettagli.className =
        "registered-boat-information";

    dettagli.appendChild(
        createDetail(
            "Anno di produzione",
            String(
                barca.anno_produzione ||
                "Non disponibile"
            )
        )
    );

    dettagli.appendChild(
        createDetail(
            "Localizzazione della barca",
            barca.localizzazione
        )
    );

    dettagli.appendChild(
        createDetail(
            "Indirizzo di consegna",
            barca.indirizzo_consegna
        )
    );

    if (statoGaranzia.attiva) {
        dettagli.appendChild(
            createDetail(
                "Attivazione garanzia",
                formatDateOnly(
                    barca.garanzia_attivata_il
                )
            )
        );

        dettagli.appendChild(
            createDetail(
                "Scadenza garanzia",
                formatDateOnly(
                    barca.garanzia_scadenza_il
                )
            )
        );
    }

    const ticketSection =
        document.createElement("section");

    ticketSection.className =
        "boat-related-tickets";

    const ticketHeading =
        document.createElement("div");

    ticketHeading.className =
        "boat-related-ticket-heading";

    const ticketTitle =
        document.createElement("h4");

    ticketTitle.textContent =
        "Ticket associati";

    const ticketCount =
        document.createElement("span");

    ticketCount.className =
        "boat-ticket-count";

    ticketCount.textContent =
        tickets.length === 1
            ? "1 ticket"
            : `${tickets.length} ticket`;

    ticketHeading.appendChild(ticketTitle);
    ticketHeading.appendChild(ticketCount);

    const ticketList =
        document.createElement("div");

    ticketList.className =
        "boat-related-ticket-list";

    if (tickets.length === 0) {
        const nessunTicket =
            document.createElement("p");

        nessunTicket.className =
            "boat-no-tickets";

        nessunTicket.textContent =
            "Non risultano ticket collegati a questa barca.";

        ticketList.appendChild(nessunTicket);
    } else {
        tickets.forEach((ticket) => {
            ticketList.appendChild(
                createTicketCard(ticket)
            );
        });
    }

    ticketSection.appendChild(ticketHeading);
    ticketSection.appendChild(ticketList);

    card.appendChild(header);
    card.appendChild(dettagli);
    card.appendChild(ticketSection);

    return card;
}

function showBoats(barche, tickets) {
    boatsList.innerHTML = "";

    if (!Array.isArray(barche) || barche.length === 0) {
        boatsList.innerHTML = `
            <div class="boats-empty-state">
                <strong>
                    Nessuna imbarcazione registrata
                </strong>

                <p>
                    Non risultano imbarcazioni associate
                    a questo account.
                </p>
            </div>
        `;

        return;
    }

    const contenitore =
        document.createElement("div");

    contenitore.className =
        "registered-boats-list";

    barche.forEach((barca) => {
        const ticketsBarca =
            tickets.filter((ticket) => {
                return (
                    Number(ticket.barca_id) ===
                    Number(barca.id)
                );
            });

        contenitore.appendChild(
            createBoatCard(
                barca,
                ticketsBarca
            )
        );
    });

    boatsList.appendChild(contenitore);
}

async function getCurrentUser() {
    const response =
        await fetch("/api/auth/me");

    const risultato =
        await response.json();

    if (response.status === 401) {
        window.location.href =
            "login.html";

        return null;
    }

    if (!response.ok) {
        throw new Error(
            risultato.message ||
            "Impossibile caricare l’utente"
        );
    }

    return risultato.utente;
}

async function loadBoatsAndTickets() {
    boatsList.innerHTML =
        "<p>Caricamento delle barche...</p>";

    boatMessage.textContent = "";
    boatMessage.className =
        "form-message";

    try {
        const parametri =
            new URLSearchParams(
                window.location.search
            );

        const clientId =
            parametri.get("cliente_id");

        let boatsUrl = "/api/boats";

        if (
            currentUser.ruolo === "operatore" &&
            clientId
        ) {
            boatsUrl +=
                `?cliente_id=${encodeURIComponent(
                    clientId
                )}`;
        }

        const [boatsResponse, ticketsResponse] =
            await Promise.all([
                fetch(boatsUrl),
                fetch("/api/tickets")
            ]);

        const boatsResult =
            await boatsResponse.json();

        const ticketsResult =
            await ticketsResponse.json();

        if (
            boatsResponse.status === 401 ||
            ticketsResponse.status === 401
        ) {
            window.location.href =
                "login.html";

            return;
        }

        if (!boatsResponse.ok) {
            throw new Error(
                boatsResult.message ||
                "Impossibile caricare le barche"
            );
        }

        if (!ticketsResponse.ok) {
            throw new Error(
                ticketsResult.message ||
                "Impossibile caricare i ticket"
            );
        }

        const barche =
            Array.isArray(boatsResult.barche)
                ? boatsResult.barche
                : [];

        let tickets =
            Array.isArray(ticketsResult.ticket)
                ? ticketsResult.ticket
                : [];

        if (
            currentUser.ruolo === "operatore" &&
            clientId
        ) {
            tickets = tickets.filter(
                (ticket) =>
                    Number(ticket.utente_id) ===
                    Number(clientId)
            );

            pageTitle.textContent =
                "Barche del cliente";

            pageDescription.textContent =
                "Consulta le imbarcazioni del cliente " +
                "e i ticket associati.";
        }

        showBoats(barche, tickets);
    } catch (error) {
        boatsList.innerHTML = "";

        boatMessage.textContent =
            error.message;

        boatMessage.className =
            "form-message error-message";
    }
}

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

            const risultato =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    risultato.message ||
                    "Logout non riuscito"
                );
            }

            window.location.href =
                "login.html";
        } catch (error) {
            boatMessage.textContent =
                error.message;

            boatMessage.className =
                "form-message error-message";
        }
    }
);

async function initializePage() {
    try {
        currentUser =
            await getCurrentUser();

        if (!currentUser) {
            return;
        }

        await loadBoatsAndTickets();
    } catch (error) {
        boatsList.innerHTML = "";

        boatMessage.textContent =
            error.message;

        boatMessage.className =
            "form-message error-message";
    }
}

initializePage();