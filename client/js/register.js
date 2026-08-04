const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "Registrazione in corso...";
    message.className = "form-message";

    const datiUtente = {
        nome: document.getElementById("nome").value,
        cognome: document.getElementById("cognome").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datiUtente)
        });

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        message.textContent = risultato.message;
        message.className = "form-message success-message";

        registerForm.reset();
    } catch (error) {
        message.textContent = error.message;
        message.className = "form-message error-message";
    }
});