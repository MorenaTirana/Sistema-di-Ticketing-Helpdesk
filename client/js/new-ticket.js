const ticketForm =
    document.getElementById("ticketForm");

const message =
    document.getElementById("message");

const clientGroup =
    document.getElementById("clientGroup");

const clientSelect =
    document.getElementById("clienteId");

const boatSelect =
    document.getElementById("barcaId");

const newBoatLink =
    document.getElementById("newBoatLink");

const submitTicketButton =
    document.getElementById("submitTicketButton");

let currentUser = null;


async function checkAuthentication() {
    try {
        const response =
            await fetch("/api/auth/me");

        const risultato =
            await response.json();

        if (!response.ok) {
            window.location.href = "login.html";
            return null;
        }

        if (
            risultato.utente.ruolo !== "utente" &&
            risultato.utente.ruolo !== "operatore"
        ) {
            window.location.href = "dashboard.html";
            return null;
        }

        return risultato.utente;
    } catch (error) {
        window.location.href = "login.html";
        return null;
    }
}


function resetBoatSelect(testo) {
    boatSelect.innerHTML = "";

    const opzione =
        document.createElement("option");

    opzione.value = "";
    opzione.textContent = testo;

    boatSelect.appendChild(opzione);
    boatSelect.disabled = true;
    submitTicketButton.disabled = true;
}

function addNewBoatOption() {
    const nuovaBarcaOption =
        document.createElement("option");

    nuovaBarcaOption.value = "__new_boat__";
    nuovaBarcaOption.textContent =
        "＋ Registra una nuova barca";

    boatSelect.appendChild(nuovaBarcaOption);
}


async function loadClients() {
    try {
        const response =
            await fetch("/api/operators/clients");

        const risultato =
            await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        clientSelect.innerHTML = "";

        const primaOpzione =
            document.createElement("option");

        primaOpzione.value = "";
        primaOpzione.textContent =
            "Seleziona un cliente";

        clientSelect.appendChild(primaOpzione);

        risultato.clienti.forEach((cliente) => {
            const opzione =
                document.createElement("option");

            opzione.value = cliente.id;

            opzione.textContent =
                `${cliente.cognome} ${cliente.nome} — ` +
                `${cliente.email} — ` +
                `${cliente.numero_barche} barche`;

            clientSelect.appendChild(opzione);
        });

        clientSelect.disabled = false;
    } catch (error) {
        message.textContent = error.message;

        message.className =
            "form-message error-message";

        clientSelect.disabled = true;
    }
}


async function loadBoats(clienteId = null) {
    try {
        resetBoatSelect(
            "Caricamento delle barche..."
        );

        let indirizzo = "/api/boats";

        if (
            currentUser.ruolo === "operatore"
        ) {
            if (!clienteId) {
                resetBoatSelect(
                    "Prima seleziona un cliente"
                );

                return;
            }

            indirizzo +=
                `?cliente_id=${encodeURIComponent(clienteId)}`;
        }

        const response = await fetch(indirizzo);
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

            addNewBoatOption();

            boatSelect.disabled = false;
            submitTicketButton.disabled = true;

            message.textContent =
                "Registra una barca prima di aprire il ticket.";

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

        addNewBoatOption();

        boatSelect.disabled = false;
        submitTicketButton.disabled = false;

        message.textContent = "";
        message.className = "form-message";
    } catch (error) {
        resetBoatSelect(
            "Impossibile caricare le barche"
        );

        message.textContent = error.message;

        message.className =
            "form-message error-message";
    }
}

boatSelect.addEventListener("change", () => {
    if (boatSelect.value !== "__new_boat__") {
        return;
    }

    if (currentUser.ruolo === "operatore") {
        const clienteId = clientSelect.value;

        if (!clienteId) {
            message.textContent =
                "Prima seleziona il cliente proprietario.";

            message.className =
                "form-message error-message";

            boatSelect.value = "";
            return;
        }

        window.location.href =
            `boats.html?cliente_id=${encodeURIComponent(clienteId)}`;

        return;
    }

    window.location.href = "boats.html";
});

clientSelect.addEventListener(
    "change",
    async () => {
        const clienteId = clientSelect.value;

        if (!clienteId) {
            resetBoatSelect(
                "Prima seleziona un cliente"
            );

            newBoatLink.href = "boats.html";
            return;
        }

        newBoatLink.href =
            `boats.html?cliente_id=${encodeURIComponent(clienteId)}`;

        await loadBoats(clienteId);
    }
);


ticketForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();


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

        if (currentUser.ruolo === "operatore") {
            datiTicket.cliente_id =
                Number(clientSelect.value);
        }

        try {
            const response = await fetch(
                "/api/tickets",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(datiTicket)
                }
            );

            const risultato =
                await response.json();

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            if (!response.ok) {
                throw new Error(risultato.message);
            }

            message.textContent =
                `Ticket creato correttamente. ` +
                `Codice identificativo: #${risultato.ticket.id}`;

            message.className =
                "form-message success-message";

            const clienteSelezionato =
                clientSelect.value;

            ticketForm.reset();

            if (currentUser.ruolo === "operatore") {
                clientSelect.value =
                    clienteSelezionato;

                await loadBoats(
                    clienteSelezionato
                );
            } else {
                await loadBoats();
            }
        } catch (error) {
            message.textContent = error.message;

            message.className =
                "form-message error-message";
        }
    }
);


async function initializePage() {
    currentUser =
        await checkAuthentication();

    if (!currentUser) {
        return;
    }

    if (currentUser.ruolo === "operatore") {
        clientGroup.hidden = false;
        clientSelect.disabled = false;

        resetBoatSelect(
            "Prima seleziona un cliente"
        );

        newBoatLink.href = "boats.html";

        await loadClients();

        const parametri =
            new URLSearchParams(
                window.location.search
            );

        const clienteId =
            Number(
                parametri.get("cliente_id")
            );

        const barcaId =
            Number(
                parametri.get("barca_id")
            );

        if (
            Number.isInteger(clienteId) &&
            clienteId > 0
        ) {
            const clienteEsiste =
                Array.from(
                    clientSelect.options
                ).some(
                    (opzione) =>
                        Number(opzione.value) === clienteId
                );

            if (clienteEsiste) {
                clientSelect.value =
                    String(clienteId);

                newBoatLink.href =
                    `boats.html?cliente_id=${clienteId}`;

                await loadBoats(clienteId);

                if (
                    Number.isInteger(barcaId) &&
                    barcaId > 0
                ) {
                    const barcaEsiste =
                        Array.from(
                            boatSelect.options
                        ).some(
                            (opzione) =>
                                Number(opzione.value) === barcaId
                        );

                    if (barcaEsiste) {
                        boatSelect.value =
                            String(barcaId);
                    }
                }
            }
        }
    } else {
        clientGroup.hidden = true;
        clientSelect.disabled = true;

        newBoatLink.href = "boats.html";

        await loadBoats();
    }
}


initializePage();