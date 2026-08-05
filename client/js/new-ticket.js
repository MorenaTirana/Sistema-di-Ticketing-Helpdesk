const ticketForm = document.getElementById("ticketForm");
const message = document.getElementById("message");

async function checkAuthentication() {
    try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
            window.location.href = "login.html";
        }
    } catch (error) {
        window.location.href = "login.html";
    }
}

ticketForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "Invio del ticket in corso...";
    message.className = "form-message";

    const datiTicket = {
        titolo: document.getElementById("titolo").value,
        categoria: document.getElementById("categoria").value,
        descrizione: document.getElementById("descrizione").value
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

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        message.textContent =
            `${risultato.message}. Numero ticket: ${risultato.ticket.id}`;

        message.className = "form-message success-message";

        ticketForm.reset();
    } catch (error) {
        message.textContent = error.message;
        message.className = "form-message error-message";
    }
});

checkAuthentication();