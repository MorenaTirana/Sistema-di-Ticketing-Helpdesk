function messaggioErrore(error) {
    if (error instanceof TypeError) {
        return "Impossibile contattare il server. Controlla la connessione e riprova.";
    }

    return error.message;
}

const resetPasswordForm =
    document.getElementById(
        "resetPasswordForm"
    );

const nuovaPasswordInput =
    document.getElementById(
        "nuovaPassword"
    );

const confermaPasswordInput =
    document.getElementById(
        "confermaPassword"
    );

const submitButton =
    document.getElementById(
        "submitButton"
    );

const message =
    document.getElementById("message");

const parametri =
    new URLSearchParams(
        window.location.search
    );

const token =
    parametri.get("token");


function disableForm(messaggio) {
    nuovaPasswordInput.disabled = true;
    confermaPasswordInput.disabled = true;
    submitButton.disabled = true;

    message.textContent = messaggio;

    message.className =
        "form-message error-message";
}


if (!token) {
    disableForm(
        "Il collegamento di recupero non è valido"
    );
}


resetPasswordForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        if (!token) {
            return;
        }

        if (
            nuovaPasswordInput.value !==
            confermaPasswordInput.value
        ) {
            message.textContent =
                "Le password inserite non corrispondono";

            message.className =
                "form-message error-message";

            return;
        }

        submitButton.disabled = true;

        message.textContent =
            "Reimpostazione della password in corso...";

        message.className =
            "form-message";

        try {
            const response =
                await fetch(
                    "/api/auth/reset-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            token,

                            nuova_password:
                                nuovaPasswordInput.value,

                            conferma_password:
                                confermaPasswordInput.value
                        })
                    }
                );

            const risultato =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    risultato.message
                );
            }

            message.textContent =
                risultato.message;

            message.className =
                "form-message success-message";

            resetPasswordForm.reset();

            nuovaPasswordInput.disabled = true;
            confermaPasswordInput.disabled = true;

            submitButton.textContent =
                "Password aggiornata";

            setTimeout(() => {
                window.location.href =
                    "login.html";
            }, 2500);
        } catch (error) {
            message.textContent =
                messaggioErrore(error);

            message.className =
                "form-message error-message";

            submitButton.disabled = false;
        }
    }
);