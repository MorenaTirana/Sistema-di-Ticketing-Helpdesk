const ticketForm =
    document.getElementById("ticketForm");

const message =
    document.getElementById("message");

const boatSelect =
    document.getElementById("barcaId");

const submitTicketButton =
    document.getElementById("submitTicketButton");


async function checkAuthentication() {
    try {
        const response = await fetch("/api/auth/me");
        const risultato = await response.json();

        if (!response.ok) {
            window.location.href = "login.html";
            return false;
        }

        if (risultato.utente.ruolo !== "utente") {
            window.location.href = "dashboard.html";
            return false;
        }

        return true;
    } catch (error) {
        window.location.href = "login.html";
        return false;
    }
}


async function loadBoats() {
    try {
        const response = await fetch("/api/boats");
        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        boatSelect.innerHTML = "";

        const primaOpzione =
            document.createElement("option");

        primaOpzione.value = "";
        primaOpzione.textContent =
            "Seleziona una barca";

        boatSelect.appendChild(primaOpzione);

        if (risultato.barche.length === 0) {
            primaOpzione.textContent =
                "Nessuna barca registrata";

            submitTicketButton.disabled = true;

            message.textContent =
                "Prima di aprire un ticket devi registrare una barca.";

            message.className =
                "form-message error-message";

            return;
        }

        risultato.barche.forEach((barca) => {
            const opzione =
                document.createElement("option");

            opzione.value = barca.id;

            opzione.textContent =
                `${barca.modello} — ${barca.matricola}`;

            boatSelect.appendChild(opzione);
        });

        submitTicketButton.disabled = false;
    } catch (error) {
        message.textContent = error.message;

        message.className =
            "form-message error-message";

        submitTicketButton.disabled = true;
    }
}


ticketForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent =
        "Invio del ticket in corso...";

    message.className = "form-message";

    const datiTicket = {
        barca_id: Number(boatSelect.value),

        tipo_richiesta:
            document.getElementById(
                "tipoRichiesta"
            ).value,

        titolo:
            document.getElementById(
                "titolo"
            ).value,

        categoria:
            document.getElementById(
                "categoria"
            ).value,

        descrizione:
            document.getElementById(
                "descrizione"
            ).value
    };

    try {
        const response = await fetch("/api/tickets", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datiTicket)
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
            `Ticket creato correttamente. Codice identificativo: #${risultato.ticket.id}`;

        message.className =
            "form-message success-message";

        ticketForm.reset();
    } catch (error) {
        message.textContent = error.message;

        message.className =
            "form-message error-message";
    }
});


async function initializePage() {
    const autenticato =
        await checkAuthentication();

    if (autenticato) {
        await loadBoats();
    }
}


initializePage();