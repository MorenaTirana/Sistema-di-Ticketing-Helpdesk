function messaggioErrore(error) {
    if (error instanceof TypeError) {
        return "Impossibile contattare il server. Controlla la connessione e riprova.";
    }

    return error.message;
}

const registerForm =
    document.getElementById("registerForm");

const message =
    document.getElementById("message");


registerForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        message.textContent =
            "Registrazione in corso...";

        message.className =
            "form-message";

        const datiUtente = {
            nome:
                document.getElementById(
                    "nome"
                ).value.trim(),

            cognome:
                document.getElementById(
                    "cognome"
                ).value.trim(),

            email:
                document.getElementById(
                    "email"
                ).value.trim(),

            telefono:
                document.getElementById(
                    "telefono"
                ).value.trim(),

            indirizzo_residenza:
                document.getElementById(
                    "indirizzoResidenza"
                ).value.trim(),

            password:
                document.getElementById(
                    "password"
                ).value
        };

        if (
            !datiUtente.nome ||
            !datiUtente.cognome ||
            !datiUtente.email ||
            !datiUtente.telefono ||
            !datiUtente.indirizzo_residenza ||
            !datiUtente.password
        ) {
            message.textContent =
                "Tutti i campi sono obbligatori";

            message.className =
                "form-message error-message";

            return;
        }

        if (
            datiUtente.telefono.length < 7 ||
            datiUtente.telefono.length > 30
        ) {
            message.textContent =
                "Numero di telefono non valido";

            message.className =
                "form-message error-message";

            return;
        }

        if (
            datiUtente.indirizzo_residenza.length < 5 ||
            datiUtente.indirizzo_residenza.length > 255
        ) {
            message.textContent =
                "Indirizzo di residenza non valido";

            message.className =
                "form-message error-message";

            return;
        }

        if (datiUtente.password.length < 8) {
            message.textContent =
                "La password deve contenere almeno 8 caratteri";

            message.className =
                "form-message error-message";

            return;
        }

        try {
            const response =
                await fetch(
                    "/api/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                datiUtente
                            )
                    }
                );

            const risultato =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    risultato.message ||
                    "Registrazione non riuscita"
                );
            }

            message.textContent =
                risultato.message;

            message.className =
                "form-message success-message";

            registerForm.reset();
        } catch (error) {
            message.textContent =
                messaggioErrore(error);

            message.className =
                "form-message error-message";
        }
    }
);