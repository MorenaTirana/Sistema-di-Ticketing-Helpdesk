const ticketList = document.getElementById("ticketList");
const message = document.getElementById("message");


const categorie = {
    problema_tecnico: "Problema tecnico",
    accesso_account: "Accesso all'account",
    fatturazione: "Fatturazione",
    informazioni: "Richiesta di informazioni",
    altro: "Altro"
};


const stati = {
    aperto: "Aperto",
    in_lavorazione: "In lavorazione",
    risolto: "Risolto",
    chiuso: "Chiuso"
};


const tipiRichiesta = {
    garanzia: "Garanzia",
    ricambi: "Ricambi",
    servizio: "Servizio"
};


const coperture = {
    da_valutare: "Da valutare",
    in_garanzia: "In garanzia",
    fuori_garanzia: "Fuori garanzia"
};

const priorita = {
    bassa: "Bassa",
    media: "Media",
    alta: "Alta",
    urgente: "Urgente"
};

function escapeHtml(testo) {
    const elemento = document.createElement("div");

    elemento.textContent =
        String(testo ?? "");

    return elemento.innerHTML;
}


function formatDate(data) {
    return new Date(data).toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


function formatCost(costo) {
    if (costo === null || costo === undefined) {
        return "Non definito";
    }

    return Number(costo).toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR"
    });
}


function createBoatInformation(ticket) {
    if (!ticket.barca_id) {
        return `
            <div class="ticket-boat ticket-boat-missing">
                <strong>Barca non associata</strong>

                <span>
                    Ticket creato prima dell'introduzione
                    della gestione delle barche.
                </span>
            </div>
        `;
    }

    return `
        <div class="ticket-boat">
            <div>
                <span class="ticket-boat-label">
                    Barca
                </span>

                <strong>
                    ${escapeHtml(ticket.barca_modello)}
                </strong>
            </div>

            <div>
                <span class="ticket-boat-label">
                    Matricola
                </span>

                <strong>
                    ${escapeHtml(ticket.barca_matricola)}
                </strong>
            </div>
        </div>
    `;
}


async function loadTickets() {
    try {
        const response =
            await fetch("/api/tickets");

        const risultato =
            await response.json();

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        if (risultato.ticket.length === 0) {
            ticketList.innerHTML = `
                <div class="empty-state">
                    <h2>Nessun ticket presente</h2>

                    <p>
                        Non hai ancora aperto richieste
                        di assistenza.
                    </p>

                    <a
                        class="button button-primary"
                        href="new-ticket.html"
                    >
                        Apri il primo ticket
                    </a>
                </div>
            `;

            return;
        }

        ticketList.innerHTML = risultato.ticket
            .map((ticket) => {
                const tipo =
                    tipiRichiesta[ticket.tipo_richiesta] ??
                    "Non indicato";

                const copertura =
                    coperture[ticket.copertura] ??
                    "Da valutare";

                return `
                    <article class="ticket-card">
                        <div class="ticket-card-header">
                            <span class="ticket-number">
                                Ticket #${ticket.id}
                            </span>

                           <div class="ticket-badges">
    <span
        class="
            ticket-priority
            priority-${ticket.priorita ?? "media"}
        "
    >
        ${priorita[ticket.priorita] ?? "Media"}
    </span>

    <span
        class="
            ticket-status
            status-${ticket.stato}
        "
    >
        ${stati[ticket.stato] ?? ticket.stato}
    </span>
</div>
                        </div>

                        <h2>
                            ${escapeHtml(ticket.titolo)}
                        </h2>

                        <p class="ticket-description">
                            ${escapeHtml(ticket.descrizione)}
                        </p>

                        ${createBoatInformation(ticket)}

                        <div class="ticket-meta">
                            <span>
                                Cliente:
                                <strong>
                                    ${escapeHtml(`${ticket.utente_nome} ${ticket.utente_cognome}`)}
                                </strong>
                            </span>
                            <span>
                                Operatore:
                                <strong>
                                    ${ticket.operatore_id
                                        ? escapeHtml(
                                            `${ticket.operatore_nome} ${ticket.operatore_cognome}`
                                        )
                                        : "Non assegnato"
                                    }
                                </strong>
                            </span>

                            <span>
                                Categoria:
                                <strong>
                                    ${categorie[ticket.categoria] ??
                                        escapeHtml(ticket.categoria)}
                                </strong>
                            </span>

                            <span>
                                Tipo:
                                <strong>${tipo}</strong>
                            </span>

                            <span>
                                Copertura:
                                <strong>${copertura}</strong>
                            </span>

                            <span>
                                Costo:
                                <strong>
                                    ${formatCost(ticket.costo)}
                                </strong>
                            </span>

                            <span>
                                Creato:
                                <strong>
                                    ${formatDate(ticket.created_at)}
                                </strong>
                            </span>
                        </div>

                        <a
                            class="ticket-detail-link"
                            href="ticket-detail.html?id=${ticket.id}"
                        >
                            Visualizza dettagli →
                        </a>
                    </article>
                `;
            })
            .join("");
    } catch (error) {
        ticketList.innerHTML = "";

        message.textContent = error.message;

        message.className =
            "form-message error-message";
    }
}


loadTickets();