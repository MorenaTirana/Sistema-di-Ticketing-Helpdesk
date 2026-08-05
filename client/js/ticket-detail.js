const ticketNumber = document.getElementById("ticketNumber");
const ticketStatus = document.getElementById("ticketStatus");
const ticketTitle = document.getElementById("ticketTitle");
const ticketDescription = document.getElementById("ticketDescription");
const ticketCategory = document.getElementById("ticketCategory");
const ticketStateText = document.getElementById("ticketStateText");
const ticketCreatedAt = document.getElementById("ticketCreatedAt");
const ticketOwner = document.getElementById("ticketOwner");

const ticketDetail = document.getElementById("ticketDetail");
const message = document.getElementById("message");

const commentsSection = document.getElementById("commentsSection");
const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const commentText = document.getElementById("commentText");
const commentsMessage = document.getElementById("commentsMessage");

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

let currentTicketId = null;

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

async function loadComments(ticketId) {
    try {
        const response = await fetch(
            `/api/tickets/${ticketId}/comments`
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        if (risultato.commenti.length === 0) {
            commentsList.innerHTML = `
                <div class="empty-comments">
                    <p>
                        Non sono ancora presenti commenti.
                        Scrivi il primo messaggio.
                    </p>
                </div>
            `;

            return;
        }

        commentsList.innerHTML = risultato.commenti
            .map((commento) => {
                return `
                    <article class="comment-card">
                        <div class="comment-header">
                            <strong>
                                ${escapeHtml(commento.utente_nome)}
                                ${escapeHtml(commento.utente_cognome)}
                            </strong>

                            <span class="comment-role">
                                ${escapeHtml(commento.utente_ruolo)}
                            </span>

                            <time>
                                ${formatDate(commento.created_at)}
                            </time>
                        </div>

                        <p>${escapeHtml(commento.testo)}</p>
                    </article>
                `;
            })
            .join("");
    } catch (error) {
        commentsMessage.textContent = error.message;
        commentsMessage.className =
            "form-message error-message";
    }
}

async function loadTicketDetail() {
    const parametri = new URLSearchParams(window.location.search);
    const ticketId = parametri.get("id");

    if (!ticketId) {
        ticketDetail.hidden = true;
        commentsSection.hidden = true;

        message.textContent =
            "Identificativo del ticket mancante";

        message.className = "form-message error-message";
        return;
    }

    currentTicketId = ticketId;

    try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        const risultato = await response.json();

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        const ticket = risultato.ticket;

        ticketNumber.textContent = `Ticket #${ticket.id}`;

        ticketStatus.textContent = stati[ticket.stato];
        ticketStatus.className =
            `ticket-status status-${ticket.stato}`;

        ticketTitle.textContent = ticket.titolo;
        ticketDescription.textContent = ticket.descrizione;
        ticketCategory.textContent = categorie[ticket.categoria];
        ticketStateText.textContent = stati[ticket.stato];
        ticketCreatedAt.textContent = formatDate(ticket.created_at);

        ticketOwner.textContent =
            `${ticket.utente_nome} ${ticket.utente_cognome}`;

        await loadComments(ticketId);
    } catch (error) {
        ticketDetail.hidden = true;
        commentsSection.hidden = true;

        message.textContent = error.message;
        message.className = "form-message error-message";
    }
}

commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    commentsMessage.textContent =
        "Invio del commento in corso...";

    commentsMessage.className = "form-message";

    try {
        const response = await fetch(
            `/api/tickets/${currentTicketId}/comments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    testo: commentText.value
                })
            }
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        commentsMessage.textContent = risultato.message;
        commentsMessage.className =
            "form-message success-message";

        commentForm.reset();

        await loadComments(currentTicketId);
    } catch (error) {
        commentsMessage.textContent = error.message;
        commentsMessage.className =
            "form-message error-message";
    }
});

loadTicketDetail();