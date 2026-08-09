const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );

const emailInput =
    document.getElementById("email");

const submitButton =
    document.getElementById("submitButton");

const message =
    document.getElementById("message");

const parametri =
    new URLSearchParams(
        window.location.search
    );

const emailPrecompilata =
    parametri.get("email");

if (emailPrecompilata) {
    emailInput.value =
        emailPrecompilata;
}

forgotPasswordForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        submitButton.disabled = true;

        message.textContent =
            "Invio della richiesta in corso...";

        message.className =
            "form-message";

        try {
            const response =
                await fetch(
                    "/api/auth/forgot-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email:
                                emailInput.value
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

            forgotPasswordForm.reset();
        } catch (error) {
            message.textContent =
                error.message;

            message.className =
                "form-message error-message";
        } finally {
            submitButton.disabled = false;
        }
    }
);