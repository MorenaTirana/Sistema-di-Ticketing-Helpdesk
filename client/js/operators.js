function messaggioErrore(error) {
    if (error instanceof TypeError) {
        return "Impossibile contattare il server. Controlla la connessione e riprova.";
    }

    return error.message;
}

const operatorsList =
    document.getElementById("operatorsList");

const operatorsMessage =
    document.getElementById("operatorsMessage");

const operatorForm =
    document.getElementById("operatorForm");

const operatorFormMessage =
    document.getElementById(
        "operatorFormMessage"
    );

const createOperatorButton =
    document.getElementById(
        "createOperatorButton"
    );

const cancelOperatorEditButton =
    document.getElementById(
        "cancelOperatorEditButton"
    );

const operatorFormTitle =
    document.getElementById(
        "operatorFormTitle"
    );

const operatorFormDescription =
    document.getElementById(
        "operatorFormDescription"
    );

const operatorPasswordFields =
    document.getElementById(
        "operatorPasswordFields"
    );

const logoutButton =
    document.getElementById("logoutButton");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById(
        "confermaPassword"
    );

let operatorsLoaded = [];
let editingOperatorId = null;

function resetOperatorForm() {
    editingOperatorId = null;

    operatorForm.reset();

    operatorFormTitle.textContent =
        "Aggiungi un nuovo operatore";

    operatorFormDescription.textContent =
        "Crea un account interno che potrà " +
        "gestire e ricevere i ticket.";

    createOperatorButton.textContent =
        "Crea operatore";

    cancelOperatorEditButton.hidden = true;
    operatorPasswordFields.hidden = false;

    passwordInput.required = true;
    confirmPasswordInput.required = true;

    operatorFormMessage.textContent = "";
    operatorFormMessage.className =
        "form-message";
}

function startOperatorEdit(operatorId) {
    const operatore =
        operatorsLoaded.find(
            (elemento) =>
                Number(elemento.id) ===
                Number(operatorId)
        );

    if (!operatore) {
        operatorFormMessage.textContent =
            "Operatore non trovato";

        operatorFormMessage.className =
            "form-message error-message";

        return;
    }

    editingOperatorId =
        Number(operatore.id);

    document.getElementById("nome").value =
        operatore.nome || "";

    document.getElementById("cognome").value =
        operatore.cognome || "";

    document.getElementById("email").value =
        operatore.email || "";

    document.getElementById("telefono").value =
        operatore.telefono || "";

    document.getElementById("funzione").value =
        operatore.funzione || "";

    passwordInput.value = "";
    confirmPasswordInput.value = "";

    passwordInput.required = false;
    confirmPasswordInput.required = false;

    operatorPasswordFields.hidden = true;

    operatorFormTitle.textContent =
        `Modifica ${operatore.nome} ` +
        `${operatore.cognome}`;

    operatorFormDescription.textContent =
        "Aggiorna i dati e la funzione " +
        "aziendale dell’operatore.";

    createOperatorButton.textContent =
        "Salva modifiche";

    cancelOperatorEditButton.hidden = false;

    operatorFormMessage.textContent = "";

    operatorForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function showOperators(operatori) {
    operatorsLoaded =
        Array.isArray(operatori)
            ? operatori
            : [];

    operatorsList.innerHTML = "";

    if (operatorsLoaded.length === 0) {
        operatorsList.innerHTML = `
            <p class="empty-message">
                Nessun operatore registrato.
            </p>
        `;

        return;
    }

    operatorsLoaded.forEach((operatore) => {
        const card =
            document.createElement("article");

        card.className =
            "operator-management-card";

        if (!operatore.attivo) {
            card.classList.add(
                "operator-management-inactive"
            );
        }

        const informazioni =
            document.createElement("div");

        informazioni.className =
            "operator-management-information";

        const intestazione =
            document.createElement("div");

        intestazione.className =
            "operator-management-heading";

        const nome =
            document.createElement("h3");

        nome.textContent =
            `${operatore.nome} ${operatore.cognome}`;

        intestazione.appendChild(nome);

        if (operatore.puo_gestire_operatori) {
            const managerBadge =
                document.createElement("span");

            managerBadge.className =
                "operator-manager-badge";

            managerBadge.textContent =
                "Operatore principale";

            intestazione.appendChild(
                managerBadge
            );
        }

        const statusBadge =
            document.createElement("span");

        statusBadge.className =
            operatore.attivo
                ? "operator-active-badge"
                : "operator-inactive-badge";

        statusBadge.textContent =
            operatore.attivo
                ? "Attivo"
                : "Disattivato";

        intestazione.appendChild(statusBadge);

        const funzione =
            document.createElement("strong");

        funzione.className =
            "operator-company-role";

        funzione.textContent =
            operatore.funzione ||
            "Funzione non indicata";

        const contatti =
            document.createElement("div");

        contatti.className =
            "operator-management-contacts";

        const email =
            document.createElement("span");

        email.textContent =
            operatore.email;

        const telefono =
            document.createElement("span");

        telefono.textContent =
            operatore.telefono ||
            "Telefono non disponibile";

        contatti.appendChild(email);
        contatti.appendChild(telefono);

        informazioni.appendChild(intestazione);
        informazioni.appendChild(funzione);
        informazioni.appendChild(contatti);

        const latoDestro =
            document.createElement("div");

        latoDestro.className =
            "operator-management-side";

        const carico =
            document.createElement("div");

        carico.className =
            "operator-ticket-workload";

        const numero =
            document.createElement("strong");

        numero.textContent =
            operatore.ticket_assegnati || 0;

        const descrizione =
            document.createElement("span");

        descrizione.textContent =
            Number(
                operatore.ticket_assegnati
            ) === 1
                ? "ticket attivo"
                : "ticket attivi";

        carico.appendChild(numero);
        carico.appendChild(descrizione);

        const azioni =
            document.createElement("div");

        azioni.className =
            "operator-management-actions";

        const modificaButton =
            document.createElement("button");

        modificaButton.type = "button";
        modificaButton.className =
            "button button-small";

        modificaButton.dataset.action =
            "edit";

        modificaButton.dataset.operatorId =
            operatore.id;

        modificaButton.textContent =
            "Modifica dati";

        azioni.appendChild(modificaButton);

        if (!operatore.puo_gestire_operatori) {
            const statusButton =
                document.createElement("button");

            statusButton.type = "button";

            statusButton.className =
                operatore.attivo
                    ? "button button-small operator-disable-button"
                    : "button button-small operator-enable-button";

            statusButton.dataset.action =
                "status";

            statusButton.dataset.operatorId =
                operatore.id;

            statusButton.dataset.active =
                String(Boolean(operatore.attivo));

            statusButton.textContent =
                operatore.attivo
                    ? "Disattiva"
                    : "Riattiva";

            azioni.appendChild(statusButton);
        }

        latoDestro.appendChild(carico);
        latoDestro.appendChild(azioni);

        card.appendChild(informazioni);
        card.appendChild(latoDestro);

        operatorsList.appendChild(card);
    });
}

async function checkPermission() {
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
            risultato.message
        );
    }

    if (
        risultato.utente.ruolo !== "operatore" ||
        !risultato.utente.puo_gestire_operatori
    ) {
        window.location.href =
            "dashboard.html";

        return false;
    }

    return true;
}

async function loadOperators() {
    operatorsMessage.textContent = "";

    try {
        const response =
            await fetch("/api/operators");

        const risultato =
            await response.json();

        if (!response.ok) {
            throw new Error(
                risultato.message
            );
        }

        showOperators(risultato.operatori);
    } catch (error) {
        operatorsList.innerHTML = "";

        operatorsMessage.textContent =
            messaggioErrore(error);

        operatorsMessage.className =
            "form-message error-message";
    }
}

operatorForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const datiOperatore = {
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
                ).value,

            funzione:
                document.getElementById(
                    "funzione"
                ).value
        };

        let url = "/api/operators";
        let method = "POST";

        if (editingOperatorId) {
            url =
                `/api/operators/${editingOperatorId}`;

            method = "PATCH";
        } else {
            const password =
                passwordInput.value;

            const confermaPassword =
                confirmPasswordInput.value;

            if (password !== confermaPassword) {
                operatorFormMessage.textContent =
                    "Le password non coincidono";

                operatorFormMessage.className =
                    "form-message error-message";

                return;
            }

            datiOperatore.password =
                password;

            datiOperatore.conferma_password =
                confermaPassword;
        }

        createOperatorButton.disabled = true;

        operatorFormMessage.textContent =
            editingOperatorId
                ? "Salvataggio delle modifiche..."
                : "Creazione dell’operatore...";

        operatorFormMessage.className =
            "form-message";

        try {
            const response =
                await fetch(
                    url,
                    {
                        method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                datiOperatore
                            )
                    }
                );

            const risultato =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    risultato.message
                );
            }

            operatorFormMessage.textContent =
                risultato.message;

            operatorFormMessage.className =
                "form-message success-message";

            resetOperatorForm();
            await loadOperators();
        } catch (error) {
            operatorFormMessage.textContent =
                messaggioErrore(error);

            operatorFormMessage.className =
                "form-message error-message";
        } finally {
            createOperatorButton.disabled =
                false;
        }
    }
);

cancelOperatorEditButton.addEventListener(
    "click",
    resetOperatorForm
);

operatorsList.addEventListener(
    "click",
    async (event) => {
        const button =
            event.target.closest(
                "button[data-action]"
            );

        if (!button) {
            return;
        }

        const operatorId =
            Number(button.dataset.operatorId);

        if (button.dataset.action === "edit") {
            startOperatorEdit(operatorId);
            return;
        }

        if (button.dataset.action !== "status") {
            return;
        }

        const currentlyActive =
            button.dataset.active === "true";

        const newStatus =
            !currentlyActive;

        const conferma =
            window.confirm(
                currentlyActive
                    ? "Vuoi disattivare questo operatore?"
                    : "Vuoi riattivare questo operatore?"
            );

        if (!conferma) {
            return;
        }

        button.disabled = true;

        try {
            const response =
                await fetch(
                    `/api/operators/${operatorId}/status`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            attivo: newStatus
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

            operatorsMessage.textContent =
                risultato.message;

            operatorsMessage.className =
                "form-message success-message";

            await loadOperators();
        } catch (error) {
            operatorsMessage.textContent =
                messaggioErrore(error);

            operatorsMessage.className =
                "form-message error-message";

            button.disabled = false;
        }
    }
);

logoutButton.addEventListener(
    "click",
    async () => {
        try {
            const response =
                await fetch(
                    "/api/auth/logout",
                    {
                        method: "POST"
                    }
                );

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
            operatorsMessage.textContent =
                messaggioErrore(error);

            operatorsMessage.className =
                "form-message error-message";
        }
    }
);

async function initializePage() {
    try {
        const autorizzato =
            await checkPermission();

        if (!autorizzato) {
            return;
        }

        await loadOperators();
    } catch (error) {
        operatorsMessage.textContent =
            messaggioErrore(error);

        operatorsMessage.className =
            "form-message error-message";
    }
}

initializePage();