const profileForm =
    document.getElementById("profileForm");

const passwordForm =
    document.getElementById("passwordForm");

const profileMessage =
    document.getElementById("profileMessage");

const passwordMessage =
    document.getElementById("passwordMessage");

const logoutButton =
    document.getElementById("logoutButton");


async function loadProfile() {
    try {
        const response =
            await fetch("/api/auth/me");

        const risultato =
            await response.json();

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        const utente = risultato.utente;

        document.getElementById("nome").value =
            utente.nome ?? "";

        document.getElementById("cognome").value =
            utente.cognome ?? "";

        document.getElementById("email").value =
            utente.email ?? "";

        document.getElementById("telefono").value =
            utente.telefono ?? "";
    } catch (error) {
        profileMessage.textContent =
            error.message;

        profileMessage.className =
            "form-message error-message";
    }
}


profileForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        profileMessage.textContent =
            "Salvataggio dei dati in corso...";

        profileMessage.className =
            "form-message";

        const datiProfilo = {
            nome:
                document.getElementById(
                    "nome"
                ).value,

            cognome:
                document.getElementById(
                    "cognome"
                ).value,

            email:
                document.getElementById(
                    "email"
                ).value,

            telefono:
                document.getElementById(
                    "telefono"
                ).value
        };

        try {
            const response =
                await fetch("/api/auth/profile", {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(datiProfilo)
                });

            const risultato =
                await response.json();

            if (response.status === 401) {
                window.location.href =
                    "login.html";

                return;
            }

            if (!response.ok) {
                throw new Error(
                    risultato.message
                );
            }

            profileMessage.textContent =
                risultato.message;

            profileMessage.className =
                "form-message success-message";
        } catch (error) {
            profileMessage.textContent =
                error.message;

            profileMessage.className =
                "form-message error-message";
        }
    }
);


passwordForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        passwordMessage.textContent =
            "Modifica della password in corso...";

        passwordMessage.className =
            "form-message";

        const datiPassword = {
            password_attuale:
                document.getElementById(
                    "passwordAttuale"
                ).value,

            nuova_password:
                document.getElementById(
                    "nuovaPassword"
                ).value,

            conferma_password:
                document.getElementById(
                    "confermaPassword"
                ).value
        };

        try {
            const response =
                await fetch("/api/auth/password", {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(datiPassword)
                });

            const risultato =
                await response.json();

            if (response.status === 401) {
                throw new Error(
                    risultato.message
                );
            }

            if (!response.ok) {
                throw new Error(
                    risultato.message
                );
            }

            passwordMessage.textContent =
                risultato.message;

            passwordMessage.className =
                "form-message success-message";

            passwordForm.reset();
        } catch (error) {
            passwordMessage.textContent =
                error.message;

            passwordMessage.className =
                "form-message error-message";
        }
    }
);


logoutButton.addEventListener(
    "click",
    async () => {
        try {
            const response =
                await fetch("/api/auth/logout", {
                    method: "POST"
                });

            if (!response.ok) {
                const risultato =
                    await response.json();

                throw new Error(
                    risultato.message
                );
            }

            window.location.href =
                "login.html";
        } catch (error) {
            profileMessage.textContent =
                error.message;

            profileMessage.className =
                "form-message error-message";
        }
    }
);


loadProfile();