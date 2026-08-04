const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const logoutButton = document.getElementById("logoutButton");
const message = document.getElementById("message");

async function loadCurrentUser() {
    try {
        const response = await fetch("/api/auth/me");
        const risultato = await response.json();

        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }

        userName.textContent =
            `${risultato.utente.nome} ${risultato.utente.cognome}`;

        userRole.textContent = risultato.utente.ruolo;
    } catch (error) {
        console.error("Errore caricamento utente:", error);
        window.location.href = "login.html";
    }
}

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
        message.className = "form-message error-message";
    }
});

loadCurrentUser();