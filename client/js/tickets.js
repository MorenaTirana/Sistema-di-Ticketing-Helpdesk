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

function escapeHtml(testo) {
    const elemento = document.createElement("div");
    elemento.textContent = testo;
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

async function loadTickets() {
    try {
        const response = await fetch("/api/tickets");
        const risultato = await response.json();

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
                    <p>Non hai ancora aperto richieste di assistenza.</p>
                    <a class="button button-primary" href="new-ticket.html">
                        Apri il primo ticket
                    </a>
                </div>
            `;

            return;
        }

        ticketList.innerHTML = risultato.ticket
            .map((ticket) => {
                return `
                    <article class="ticket-card">
                        <div class="ticket-card-header">
                            <span class="ticket-number">
                                Ticket #${ticket.id}
                            </span>

                            <span class="ticket-status status-${ticket.stato}">
                                ${stati[ticket.stato]}
                            </span>
                        </div>

                        <h2>${escapeHtml(ticket.titolo)}</h2>

                        <p class="ticket-description">
                            ${escapeHtml(ticket.descrizione)}
                        </p>

                        <div class="ticket-meta">
                            <span>
                                Categoria:
                                <strong>${categorie[ticket.categoria]}</strong>
                            </span>

                            <span>
                                Creato:
                                <strong>${formatDate(ticket.created_at)}</strong>
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
        message.className = "form-message error-message";
    }
}

loadTickets();