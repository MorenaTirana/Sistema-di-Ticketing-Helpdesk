const boatsList =
    document.getElementById("boatsList");

const boatMessage =
    document.getElementById("boatMessage");

const logoutButton =
    document.getElementById("logoutButton");

const pageTitle =
    document.getElementById("pageTitle");

const pageDescription =
    document.getElementById("pageDescription");

const openBoatFormButton =
    document.getElementById(
        "openBoatFormButton"
    );

const closeBoatFormButton =
    document.getElementById(
        "closeBoatFormButton"
    );

const cancelBoatFormButton =
    document.getElementById(
        "cancelBoatFormButton"
    );

const boatModal =
    document.getElementById("boatModal");

const boatForm =
    document.getElementById("boatForm");

const boatFormMessage =
    document.getElementById(
        "boatFormMessage"
    );

const saveBoatButton =
    document.getElementById(
        "saveBoatButton"
    );

const boatClientId =
    document.getElementById(
        "boatClientId"
    );

const stati = {
    aperto: "Aperto",
    in_lavorazione: "In lavorazione",
    risolto: "Risolto",
    chiuso: "Chiuso"
};

const categorie = {
    problema_tecnico: "Problema tecnico",
    accesso_account: "Accesso account",
    fatturazione: "Fatturazione",
    informazioni: "Informazioni",
    altro: "Altro"
};

const priorita = {
    bassa: "Bassa",
    media: "Media",
    alta: "Alta",
    urgente: "Urgente"
};

let currentUser = null;

function formatDate(data) {
    if (!data) {
        return "Data non disponibile";
    }

    return new Date(data).toLocaleString(
        "it-IT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function formatDateOnly(data) {
    if (!data) {
        return "Non indicata";
    }

    return new Date(data).toLocaleDateString(
        "it-IT",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC"
        }
    );
}

function getWarrantyStatus(barca) {
    if (!barca.garanzia_scadenza_il) {
        return {
            testo: "Fuori garanzia",
            classe: "warranty-expired",
            attiva: false
        };
    }

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const scadenza =
        new Date(barca.garanzia_scadenza_il);

    scadenza.setHours(0, 0, 0, 0);

    if (scadenza >= oggi) {
        return {
            testo: "In garanzia",
            classe: "warranty-active",
            attiva: true
        };
    }

    return {
        testo: "Fuori garanzia",
        classe: "warranty-expired",
        attiva: false
    };
}

function createDetail(label, value) {
    const elemento =
        document.createElement("div");

    const etichetta =
        document.createElement("dt");

    etichetta.textContent = label;

    const contenuto =
        document.createElement("dd");

    contenuto.textContent =
        value || "Non disponibile";

    elemento.appendChild(etichetta);
    elemento.appendChild(contenuto);

    return elemento;
}

function createTicketCard(ticket) {
    const card =
        document.createElement("article");

    card.className =
        `boat-ticket-card boat-ticket-${ticket.stato}`;

    /*
     * Parte sempre visibile.
     */
    const riepilogo =
        document.createElement("div");

    riepilogo.className =
        "boat-ticket-summary";

    const intestazione =
        document.createElement("div");

    intestazione.className =
        "boat-ticket-heading";

    const numero =
        document.createElement("span");

    numero.className =
        "boat-ticket-number";

    numero.textContent =
        `Ticket n. ${ticket.id}`;

    const stato =
        document.createElement("span");

    stato.className =
        `ticket-status status-${ticket.stato}`;

    stato.textContent =
        stati[ticket.stato] ||
        ticket.stato ||
        "Stato non disponibile";

    intestazione.appendChild(numero);

    const titolo =
        document.createElement("h4");

    titolo.className =
        "boat-ticket-title";

    titolo.textContent =
        ticket.titolo ||
        "Ticket senza titolo";

    const panelId =
        `boat-ticket-panel-${ticket.id}`;

    const toggleButton =
        document.createElement("button");

    toggleButton.className =
        "boat-ticket-toggle";

    toggleButton.type =
        "button";

    toggleButton.setAttribute(
        "aria-expanded",
        "false"
    );

    toggleButton.setAttribute(
        "aria-controls",
        panelId
    );

    toggleButton.setAttribute(
        "aria-label",
        `Mostra i dati del ticket ${ticket.id}`
    );

    toggleButton.title =
        "Mostra informazioni";

    toggleButton.innerHTML = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M6 9l6 6 6-6"></path>
        </svg>
    `;

  riepilogo.appendChild(intestazione);
riepilogo.appendChild(titolo);
riepilogo.appendChild(stato);
riepilogo.appendChild(toggleButton);

    /*
     * Pannello inizialmente nascosto.
     */
    const pannello =
        document.createElement("div");

    pannello.className =
        "boat-ticket-panel";

    pannello.id =
        panelId;

    pannello.hidden =
        true;

    const informazioni =
        document.createElement("dl");

    informazioni.className =
        "boat-ticket-information";

    informazioni.appendChild(
        createDetail(
            "Categoria",
            categorie[ticket.categoria] ||
            "Non indicata"
        )
    );

    informazioni.appendChild(
        createDetail(
            "Priorità",
            priorita[ticket.priorita] ||
            "Media"
        )
    );

    informazioni.appendChild(
    createDetail(
        "Indirizzo di consegna",
        ticket.indirizzo_consegna ||
        "Non indicato"
    )
);
    informazioni.appendChild(
        createDetail(
            "Data di apertura",
            formatDate(ticket.created_at)
        )
    );

    const azioni =
        document.createElement("div");

    azioni.className =
        "boat-ticket-actions";

    const collegamento =
        document.createElement("a");

    collegamento.className =
        "button boat-ticket-detail-button";

    collegamento.href =
        `ticket-detail.html?id=${encodeURIComponent(
            ticket.id
        )}`;

    collegamento.textContent =
        "Visualizza dettaglio";

    azioni.appendChild(collegamento);

    pannello.appendChild(informazioni);
    pannello.appendChild(azioni);

    /*
     * Apertura e chiusura.
     */
    toggleButton.addEventListener(
        "click",
        () => {
            const deveAprire =
                pannello.hidden;

            pannello.hidden =
                !deveAprire;

            toggleButton.setAttribute(
                "aria-expanded",
                String(deveAprire)
            );

            toggleButton.setAttribute(
                "aria-label",
                deveAprire
                    ? `Nascondi i dati del ticket ${ticket.id}`
                    : `Mostra i dati del ticket ${ticket.id}`
            );

            toggleButton.title =
                deveAprire
                    ? "Nascondi informazioni"
                    : "Mostra informazioni";

            card.classList.toggle(
                "is-open",
                deveAprire
            );
        }
    );

    card.appendChild(riepilogo);
    card.appendChild(pannello);

    return card;
}

function createBoatCard(barca, tickets) {
    const card =
        document.createElement("article");

    card.className =
        "registered-boat-card";

    const header =
        document.createElement("div");

    header.className =
        "registered-boat-header";

    const identificazione =
        document.createElement("div");
        identificazione.className =
    "boat-identity-data";

    const etichetta =
        document.createElement("span");

    etichetta.className =
        "registered-boat-label";

    etichetta.textContent =
    "Imbarcazione:";

    const titolo =
        document.createElement("h3");

    titolo.textContent =
        barca.modello ||
        "Modello non disponibile";

    const matricola =
        document.createElement("p");

    matricola.textContent = "";

const matricolaLabel =
    document.createElement("span");

matricolaLabel.className =
    "boat-serial-label";

matricolaLabel.textContent =
    "Matricola:";

const matricolaValue =
    document.createElement("span");

matricolaValue.className =
    "boat-serial-value";

matricolaValue.textContent =
    barca.matricola ||
    "Non disponibile";

matricola.appendChild(
    matricolaLabel
);

matricola.appendChild(
    matricolaValue
);

    identificazione.appendChild(etichetta);
    identificazione.appendChild(titolo);
    identificazione.appendChild(matricola);

    const statoGaranzia =
        getWarrantyStatus(barca);

  
header.appendChild(
    identificazione
);


    const dettagli =
        document.createElement("dl");

    dettagli.className =
        "registered-boat-information";

    dettagli.appendChild(
        createDetail(
            "Anno di produzione",
            String(
                barca.anno_produzione ||
                "Non disponibile"
            )
        )
    );

    dettagli.appendChild(
        createDetail(
            "Localizzazione barca",
            barca.localizzazione
        )
    );
const dettaglioGaranzia =
    createDetail(
        "In garanzia?",
        statoGaranzia.attiva
            ? "SÌ"
            : "NO"
    );

dettaglioGaranzia.classList.add(
    "boat-warranty-detail"
);

const valoreGaranzia =
    dettaglioGaranzia.querySelector("dd");

valoreGaranzia.classList.add(
    statoGaranzia.attiva
        ? "warranty-text-active"
        : "warranty-text-expired"
);

dettagli.appendChild(
    dettaglioGaranzia
);


    if (statoGaranzia.attiva) {
        dettagli.appendChild(
            createDetail(
                "Attivazione garanzia",
                formatDateOnly(
                    barca.garanzia_attivata_il
                )
            )
        );

        dettagli.appendChild(
            createDetail(
                "Scadenza garanzia",
                formatDateOnly(
                    barca.garanzia_scadenza_il
                )
            )
        );
    }

    const ticketSection =
        document.createElement("section");

    ticketSection.className =
        "boat-related-tickets";

    const ticketHeading =
        document.createElement("div");

    ticketHeading.className =
        "boat-related-ticket-heading";

    const ticketTitle =
        document.createElement("h4");

    ticketTitle.textContent =
        "Ticket associati";

    const ticketCount =
        document.createElement("span");

    ticketCount.className =
        "boat-ticket-count";

   ticketCount.textContent =
    String(tickets.length);

    ticketHeading.appendChild(ticketTitle);
    ticketHeading.appendChild(ticketCount);

    const ticketList =
        document.createElement("div");

    ticketList.className =
        "boat-related-ticket-list";

    if (tickets.length === 0) {
        const nessunTicket =
            document.createElement("p");

        nessunTicket.className =
            "boat-no-tickets";

        nessunTicket.textContent =
            "Non risultano ticket collegati a questa barca.";

        ticketList.appendChild(nessunTicket);
    } else {
        tickets.forEach((ticket) => {
            ticketList.appendChild(
                createTicketCard(ticket)
            );
        });
    }

    ticketSection.appendChild(ticketHeading);
    ticketSection.appendChild(ticketList);

    card.appendChild(header);
    card.appendChild(dettagli);
    card.appendChild(ticketSection);

    return card;
}

function showBoats(barche, tickets) {
    boatsList.innerHTML = "";

    if (!Array.isArray(barche) || barche.length === 0) {
        boatsList.innerHTML = `
            <div class="boats-empty-state">
                <strong>
                    Nessuna imbarcazione registrata
                </strong>

                <p>
                    Non risultano imbarcazioni associate
                    a questo account.
                </p>
            </div>
        `;

        return;
    }

    const contenitore =
        document.createElement("div");

    contenitore.className =
        "registered-boats-list";

    barche.forEach((barca) => {
        const ticketsBarca =
            tickets.filter((ticket) => {
                return (
                    Number(ticket.barca_id) ===
                    Number(barca.id)
                );
            });

        contenitore.appendChild(
            createBoatCard(
                barca,
                ticketsBarca
            )
        );
    });

    boatsList.appendChild(contenitore);
}

async function getCurrentUser() {
    const response =
        await fetch("/api/auth/me");

    const risultato =
        await response.json();

    if (response.status === 401) {
        window.location.href =
            "login.html";

        return null;
    }

    if (!response.ok) {
        throw new Error(
            risultato.message ||
            "Impossibile caricare l’utente"
        );
    }

    return risultato.utente;
}

async function loadBoatsAndTickets() {
    boatsList.innerHTML =
        "<p>Caricamento delle barche...</p>";

    boatMessage.textContent = "";
    boatMessage.className =
        "form-message";

    try {
        const parametri =
            new URLSearchParams(
                window.location.search
            );

        const clientId =
            parametri.get("cliente_id");

        let boatsUrl = "/api/boats";

        if (
            currentUser.ruolo === "operatore" &&
            clientId
        ) {
            boatsUrl +=
                `?cliente_id=${encodeURIComponent(
                    clientId
                )}`;
        }

        const [boatsResponse, ticketsResponse] =
            await Promise.all([
                fetch(boatsUrl),
                fetch("/api/tickets")
            ]);

        const boatsResult =
            await boatsResponse.json();

        const ticketsResult =
            await ticketsResponse.json();

        if (
            boatsResponse.status === 401 ||
            ticketsResponse.status === 401
        ) {
            window.location.href =
                "login.html";

            return;
        }

        if (!boatsResponse.ok) {
            throw new Error(
                boatsResult.message ||
                "Impossibile caricare le barche"
            );
        }

        if (!ticketsResponse.ok) {
            throw new Error(
                ticketsResult.message ||
                "Impossibile caricare i ticket"
            );
        }

        const barche =
            Array.isArray(boatsResult.barche)
                ? boatsResult.barche
                : [];

        let tickets =
            Array.isArray(ticketsResult.ticket)
                ? ticketsResult.ticket
                : [];

        if (
            currentUser.ruolo === "operatore" &&
            clientId
        ) {
            tickets = tickets.filter(
                (ticket) =>
                    Number(ticket.utente_id) ===
                    Number(clientId)
            );

            pageTitle.textContent =
                "Barche del cliente";

            pageDescription.textContent =
                "Consulta le imbarcazioni del cliente " +
                "e i ticket associati.";
        }

        showBoats(barche, tickets);
    } catch (error) {
        boatsList.innerHTML = "";

        boatMessage.textContent =
            error.message;

        boatMessage.className =
            "form-message error-message";
    }
}

function openBoatModal() {
    boatForm.reset();

    boatFormMessage.textContent = "";
    boatFormMessage.className =
        "form-message";

    const annoCorrente =
        new Date().getFullYear();

    const yearInput =
        document.getElementById("boatYear");

    yearInput.max =
        String(annoCorrente);

    yearInput.value =
        String(annoCorrente);

    const parametri =
        new URLSearchParams(
            window.location.search
        );

    const clientId =
        parametri.get("cliente_id");

    boatClientId.value =
        currentUser.ruolo === "operatore"
            ? clientId || ""
            : "";

    boatModal.hidden = false;

    document.body.classList.add(
        "boat-modal-open"
    );

    document
        .getElementById("boatModel")
        .focus();
}

function closeBoatModal() {
    boatModal.hidden = true;

    document.body.classList.remove(
        "boat-modal-open"
    );
}

openBoatFormButton.addEventListener(
    "click",
    openBoatModal
);

closeBoatFormButton.addEventListener(
    "click",
    closeBoatModal
);

cancelBoatFormButton.addEventListener(
    "click",
    closeBoatModal
);

boatModal.addEventListener(
    "click",
    (event) => {
        if (
            event.target.hasAttribute(
                "data-close-boat-modal"
            )
        ) {
            closeBoatModal();
        }
    }
);

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            !boatModal.hidden
        ) {
            closeBoatModal();
        }
    }
);

boatForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        boatFormMessage.textContent = "";
        boatFormMessage.className =
            "form-message";

        const formData =
            new FormData(boatForm);

        const datiBarca = {
            modello:
                formData
                    .get("modello")
                    .trim(),

            matricola:
                formData
                    .get("matricola")
                    .trim(),

            anno_produzione:
                Number(
                    formData.get(
                        "anno_produzione"
                    )
                ),

            localizzazione:
                formData
                    .get("localizzazione")
                    .trim(),


            garanzia_attivata_il:
                formData.get(
                    "garanzia_attivata_il"
                ) || null
        };

        const clienteId =
            formData.get("cliente_id");

        if (
            currentUser.ruolo === "operatore"
        ) {
            if (!clienteId) {
                boatFormMessage.textContent =
                    "Apri la pagina dalla scheda di un cliente per registrare la sua barca.";

                boatFormMessage.className =
                    "form-message error-message";

                return;
            }

            datiBarca.cliente_id =
                Number(clienteId);
        }

        try {
            saveBoatButton.disabled = true;
            saveBoatButton.textContent =
                "Registrazione...";

            const response =
                await fetch(
                    "/api/boats",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                datiBarca
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

            closeBoatModal();

            boatMessage.textContent =
                risultato.message;

            boatMessage.className =
                "form-message success-message";

            await loadBoatsAndTickets();
        } catch (error) {
            boatFormMessage.textContent =
                error.message;

            boatFormMessage.className =
                "form-message error-message";
        } finally {
            saveBoatButton.disabled = false;
            saveBoatButton.textContent =
                "Registra barca";
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

            const risultato =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    risultato.message ||
                    "Logout non riuscito"
                );
            }

            window.location.href =
                "login.html";
        } catch (error) {
            boatMessage.textContent =
                error.message;

            boatMessage.className =
                "form-message error-message";
        }
    }
);

async function initializePage() {
    try {
        currentUser =
            await getCurrentUser();

        if (!currentUser) {
            return;
        }
        const parametri =
    new URLSearchParams(
        window.location.search
    );

const clientId =
    parametri.get("cliente_id");

/*
 * Un operatore può aggiungere una barca
 * solo quando sta visualizzando uno
 * specifico cliente.
 */
if (
    currentUser.ruolo === "operatore" &&
    !clientId
) {
    openBoatFormButton.hidden = true;
}

        await loadBoatsAndTickets();
    } catch (error) {
        boatsList.innerHTML = "";

        boatMessage.textContent =
            error.message;

        boatMessage.className =
            "form-message error-message";
    }
}

initializePage();