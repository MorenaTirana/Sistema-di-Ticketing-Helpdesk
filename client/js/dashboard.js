function messaggioErrore(error) {
    if (error instanceof TypeError) {
        return "Impossibile contattare il server. Controlla la connessione e riprova.";
    }

    return error.message;
}

const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const roleInformation =
    document.getElementById("roleInformation");
const operatorManagementCard =
    document.getElementById(
        "operatorManagementCard"
    );
const logoutButton = document.getElementById("logoutButton");
const message = document.getElementById("message");

const notificationsButton =
    document.getElementById("notificationsButton");

const notificationsCount =
    document.getElementById("notificationsCount");

const notificationsPanel =
    document.getElementById("notificationsPanel");

const notificationsList =
    document.getElementById("notificationsList");

const boatsCardTitle =
    document.getElementById("boatsCardTitle");

const boatsCardDescription =
    document.getElementById("boatsCardDescription");

const totalTicketsCount =
    document.getElementById("totalTicketsCount");

const openTicketsCount =
    document.getElementById("openTicketsCount");

const workingTicketsCount =
    document.getElementById("workingTicketsCount");

const resolvedTicketsCount =
    document.getElementById("resolvedTicketsCount");

const closedTicketsCount =
    document.getElementById("closedTicketsCount");

const avgResolutionTime =
    document.getElementById("avgResolutionTime");

async function loadCurrentUser() {
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
                risultato.message ||
                "Impossibile caricare l’utente"
            );
        }

        const utente =
            risultato.utente;

        userName.textContent =
            `${utente.nome} ${utente.cognome}`;

        if (utente.ruolo === "operatore") {
            if (userRole) {
                userRole.textContent =
                    "Operatore";
            }

            if (roleInformation) {
                roleInformation.hidden =
                    false;
            }

            boatsCardTitle.textContent =
                "Barche clienti";

            boatsCardDescription.textContent =
                "Consulta le imbarcazioni registrate dai clienti.";


            operatorManagementCard.hidden =
                !utente.puo_gestire_operatori;

        } else {
            if (roleInformation) {
                roleInformation.hidden =
                    true;
            }

            boatsCardTitle.textContent =
                "Le mie barche";

            boatsCardDescription.textContent =
                "Consulta le tue imbarcazioni registrate.";

            operatorManagementCard.hidden = true;
        }

        return true;
    } catch (error) {
        console.error(
            "Errore caricamento utente:",
            error
        );

        message.textContent =
            messaggioErrore(error);

        message.className =
            "form-message error-message";

        return false;
    }
}

async function loadTicketSummary() {
    try {
        const response =
            await fetch("/api/tickets");

        const risultato =
            await response.json();

        if (!response.ok) {
            throw new Error(
                risultato.message ||
                "Impossibile caricare il riepilogo dei ticket"
            );
        }

        const tickets =
            Array.isArray(risultato.ticket)
                ? risultato.ticket
                : [];

        const totals = {
            aperto: 0,
            in_lavorazione: 0,
            risolto: 0,
            chiuso: 0
        };

        tickets.forEach((ticket) => {
            if (
                Object.prototype.hasOwnProperty.call(
                    totals,
                    ticket.stato
                )
            ) {
                totals[ticket.stato] += 1;
            }
        });
        totalTicketsCount.textContent =
            tickets.length;

        openTicketsCount.textContent =
            totals.aperto;

        workingTicketsCount.textContent =
            totals.in_lavorazione;

        resolvedTicketsCount.textContent =
            totals.risolto + totals.chiuso;

        closedTicketsCount.textContent =
            totals.chiuso;

        const ticketRisolti = tickets.filter(
            (ticket) =>
                ticket.stato === "risolto" ||
                ticket.stato === "chiuso"
        );

        if (ticketRisolti.length > 0) {
            const oreTotali = ticketRisolti.reduce(
                (somma, ticket) => {
                    const apertura =
                        new Date(ticket.created_at);

                    const ultimoAggiornamento =
                        new Date(ticket.updated_at);

                    const ore =
                        (ultimoAggiornamento - apertura) /
                        (1000 * 60 * 60);

                    return somma + Math.max(ore, 0);
                },
                0
            );

            const oreMedie =
                oreTotali / ticketRisolti.length;

            avgResolutionTime.textContent =
                oreMedie < 24
                    ? `${oreMedie.toFixed(1)} ore`
                    : `${(oreMedie / 24).toFixed(1)} giorni`;
        } else {
            avgResolutionTime.textContent = "—";
        }
    } catch (error) {
        console.error(
            "Errore caricamento riepilogo:",
            error
        );

        message.textContent =
            messaggioErrore(error);

        message.className =
            "form-message error-message";
    }
}

async function loadNotifications() {
    try {
        const response = await fetch("/api/notifications");
        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        showNotifications(risultato.notifiche);
    } catch (error) {
        console.error(
            "Errore caricamento notifiche:",
            error
        );

        notificationsList.textContent =
            "Impossibile caricare le notifiche.";
    }
}


function showNotifications(notifiche) {
    notificationsList.innerHTML = "";

    const notificheNonLette = notifiche.filter(
        (notifica) => !notifica.letta
    );

    notificationsCount.textContent =
        notificheNonLette.length;

    notificationsCount.hidden =
        notificheNonLette.length === 0;

    if (notifiche.length === 0) {
        const testo = document.createElement("p");
        testo.textContent = "Non ci sono notifiche.";

        notificationsList.appendChild(testo);
        return;
    }

    notifiche.forEach((notifica) => {
        const elemento = document.createElement("button");

        elemento.type = "button";
        elemento.className = "notification-item";

        if (!notifica.letta) {
            elemento.classList.add("notification-unread");
        }

        const messaggio = document.createElement("strong");
        messaggio.textContent = notifica.messaggio;

        const data = document.createElement("small");
        data.textContent = new Date(
            notifica.created_at
        ).toLocaleString("it-IT");

        elemento.appendChild(messaggio);
        elemento.appendChild(data);

        elemento.addEventListener("click", () => {
            openNotification(notifica);
        });

        notificationsList.appendChild(elemento);
    });
}


async function openNotification(notifica) {
    try {
        if (!notifica.letta) {
            const response = await fetch(
                `/api/notifications/${notifica.id}/read`,
                {
                    method: "PATCH"
                }
            );

            const risultato = await response.json();

            if (!response.ok) {
                throw new Error(risultato.message);
            }
        }

        window.location.href =
            `ticket-detail.html?id=${notifica.ticket_id}`;
    } catch (error) {
        message.textContent = messaggioErrore(error);
        message.className =
            "form-message error-message";
    }
}


notificationsButton.addEventListener("click", () => {
    notificationsPanel.hidden =
        !notificationsPanel.hidden;
});


logoutButton.addEventListener("click", async () => {
    try {
        const response = await fetch("/api/auth/logout", {
            method: "POST"
        });

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        window.location.href = "login.html";
    } catch (error) {
        message.textContent = messaggioErrore(error);
        message.className =
            "form-message error-message";
    }
});

async function initializeDashboard() {
    const utenteCaricato =
        await loadCurrentUser();

    if (utenteCaricato) {
        await Promise.all([
            loadNotifications(),
            loadTicketSummary()
        ]);
    }
}

initializeDashboard();