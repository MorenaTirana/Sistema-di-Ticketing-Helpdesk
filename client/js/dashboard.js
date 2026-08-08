const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
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

async function loadCurrentUser() {
    try {
        const response = await fetch("/api/auth/me");
        const risultato = await response.json();

        if (!response.ok) {
            window.location.href = "login.html";
            return false;
        }

        userName.textContent =
            `${risultato.utente.nome} ${risultato.utente.cognome}`;

        userRole.textContent = risultato.utente.ruolo;
        if (risultato.utente.ruolo === "operatore") {
            boatsCardTitle.textContent = "Barche clienti";

            boatsCardDescription.textContent =
                 "Consulta le imbarcazioni registrate dai clienti.";
    }

        return true;
    } catch (error) {
        console.error("Errore caricamento utente:", error);
        window.location.href = "login.html";

        return false;
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
        message.textContent = error.message;
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
        message.textContent = error.message;
        message.className =
            "form-message error-message";
    }
});


async function initializeDashboard() {
    const utenteCaricato = await loadCurrentUser();

    if (utenteCaricato) {
        await loadNotifications();
    }
}

initializeDashboard();