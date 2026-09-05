function messaggioErrore(error) {
    if (error instanceof TypeError) {
        return "Impossibile contattare il server. Controlla la connessione e riprova.";
    }

    return error.message;
}

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

const ticketIntroduction =
    document.getElementById("ticketIntroduction");

const ticketFormCard =
    document.getElementById("ticketFormCard");

const ticketSuccess =
    document.getElementById("ticketSuccess");

const ticketSuccessMessage =
    document.getElementById("ticketSuccessMessage");

const createdTicketLink =
    document.getElementById("createdTicketLink");

const attachmentsInput =
    document.getElementById("allegati");

const boatLocationInput =
    document.getElementById("localizzazioneBarca");

const deliveryAddressInput =
    document.getElementById("indirizzoConsegna");

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
    boatLocationInput.value = "";
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
        message.textContent = messaggioErrore(error);

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

            opzione.dataset.localizzazione =
                barca.localizzazione || "";

            opzione.textContent =
                `${barca.modello} — ${barca.matricola}`;

            boatSelect.appendChild(opzione);
        });

        addNewBoatOption();

        boatSelect.disabled = false;
        submitTicketButton.disabled = false;
    } catch (error) {
        resetBoatSelect(
            "Impossibile caricare le barche"
        );

        message.textContent = messaggioErrore(error);

        message.className =
            "form-message error-message";
    }
}

boatSelect.addEventListener("change", () => {
    if (boatSelect.value === "__new_boat__") {
        boatLocationInput.value = "";

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
        return;
    }

    const opzioneSelezionata =
        boatSelect.options[boatSelect.selectedIndex];

    boatLocationInput.value =
        opzioneSelezionata?.dataset.localizzazione || "";
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
            deliveryAddressInput.value = "";
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

        const localizzazioneBarca =
            boatLocationInput.value.trim();

        const indirizzoConsegna =
            deliveryAddressInput.value.trim();

        if (!localizzazioneBarca) {
            message.textContent =
                "Inserisci la localizzazione attuale della barca.";

            message.className =
                "form-message error-message";

            boatLocationInput.focus();
            return;
        }

        if (!indirizzoConsegna) {
            message.textContent =
                "Inserisci l'indirizzo di consegna per questo ticket.";

            message.className =
                "form-message error-message";

            deliveryAddressInput.focus();
            return;
        }

        boatLocationInput.value =
            localizzazioneBarca;

        deliveryAddressInput.value =
            indirizzoConsegna;

        const files =
            Array.from(attachmentsInput.files);

        const containsPhotoOrVideo =
            files.some((file) =>
                file.type.startsWith("image/") ||
                file.type.startsWith("video/")
            );

        if (!containsPhotoOrVideo) {
            message.textContent =
                "Carica almeno una foto o un video del problema.";

            message.className =
                "form-message error-message";

            return;
        }

        if (files.length > 8) {
            message.textContent =
                "Puoi caricare al massimo 8 file per ticket.";

            message.className =
                "form-message error-message";

            return;
        }

        const fileTroppoGrande = files.find(
            (file) => file.size > 100 * 1024 * 1024
        );

        if (fileTroppoGrande) {
            message.textContent =
                `Il file "${fileTroppoGrande.name}" supera la dimensione massima di 100 MB.`;

            message.className =
                "form-message error-message";

            return;
        }

        message.textContent =
            "Invio del ticket in corso...";

        message.className = "form-message";

        submitTicketButton.disabled = true;

        const datiTicket =
            new FormData(ticketForm);

        try {
            const response = await fetch(
                "/api/tickets",
                {
                    method: "POST",

                    body: datiTicket
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

            const ticketId =
                risultato.ticket.id;

            ticketIntroduction.hidden = true;
            ticketFormCard.hidden = true;
            ticketSuccess.hidden = false;

            ticketSuccessMessage.textContent =
                `Il ticket n. ${ticketId} è stato creato e verrà ` +
                `processato dai nostri operatori entro 48 ore. ` +
                `Per ulteriori informazioni può sollecitare un riscontro ` +
                `all’interno del ticket, contattarci al numero +39 32654231 ` +
                `oppure scrivere a sesa@sesamarin.com.`;

            createdTicketLink.href =
                `ticket-detail.html?id=${ticketId}`;

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } catch (error) {
            message.textContent =
                messaggioErrore(error);

            message.className =
                "form-message error-message";

            submitTicketButton.disabled = false;
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

                        boatSelect.dispatchEvent(
                            new Event("change")
                        );
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