const ticketNumber = document.getElementById("ticketNumber");
const ticketStatus = document.getElementById("ticketStatus");
const ticketTitle = document.getElementById("ticketTitle");
const ticketDescription = document.getElementById("ticketDescription");
const ticketCategory = document.getElementById("ticketCategory");
const ticketStateText = document.getElementById("ticketStateText");
const ticketPriority = document.getElementById("ticketPriority");
const ticketCreatedAt = document.getElementById("ticketCreatedAt");
const ticketOwner = document.getElementById("ticketOwner");
const ticketAssignedOperator = document.getElementById("ticketAssignedOperator");
const ticketRequestType = document.getElementById("ticketRequestType");
const ticketCoverage = document.getElementById("ticketCoverage");
const ticketCost = document.getElementById("ticketCost");
const ticketBoatSection = document.getElementById("ticketBoatSection");
const ticketBoatMissingSection = document.getElementById("ticketBoatMissingSection");
const ticketBoatAssignmentMessage = document.getElementById("ticketBoatAssignmentMessage");
const boatModel = document.getElementById("boatModel");
const boatRegistration = document.getElementById("boatRegistration");
const boatProductionYear = document.getElementById("boatProductionYear");
const boatLocation = document.getElementById("boatLocation");
const boatDeliveryAddress = document.getElementById("boatDeliveryAddress");
const boatWarrantyStart = document.getElementById("boatWarrantyStart");
const boatWarrantyEnd = document.getElementById("boatWarrantyEnd");
const boatWarrantyStatus = document.getElementById("boatWarrantyStatus");
const ticketDetail = document.getElementById("ticketDetail");
const message = document.getElementById("message");
const commentsSection = document.getElementById("commentsSection");
const customerFeedbackList =
    document.getElementById(
        "customerFeedbackList"
    );

const operatorFeedbackList =
    document.getElementById(
        "operatorFeedbackList"
    );

const feedbackFormTitle =
    document.getElementById(
        "feedbackFormTitle"
    );
const commentForm = document.getElementById("commentForm");
const commentText = document.getElementById("commentText");
const commentsMessage = document.getElementById("commentsMessage");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const historyMessage = document.getElementById("historyMessage");
const documentsSection = document.getElementById("documentsSection");
const ticketDocumentsList = document.getElementById("ticketDocumentsList");
const clientDocumentsList = document.getElementById("clientDocumentsList");
const clientDocumentsForm = document.getElementById("clientDocumentsForm");
const clientDocuments = document.getElementById("clientDocuments");
const uploadClientDocumentsButton = document.getElementById("uploadClientDocumentsButton");
const clientDocumentsMessage = document.getElementById("clientDocumentsMessage");
const documentsMessage = document.getElementById("documentsMessage");
const operatorRicArchive = document.getElementById("operatorRicArchive");
const documentUploadSection = document.getElementById("documentUploadSection");
const ticketOwnerEmail = document.getElementById("ticketOwnerEmail");
const additionalAttachmentsForm = document.getElementById("additionalAttachmentsForm");
const additionalAttachments = document.getElementById("additionalAttachments");
const uploadAttachmentsButton = document.getElementById("uploadAttachmentsButton");
const attachmentsMessage = document.getElementById("attachmentsMessage");
const ticketAttachmentsSection = document.getElementById("ticketAttachmentsSection");
const ticketAttachmentsList = document.getElementById("ticketAttachmentsList");
const ticketOwnerPhone = document.getElementById("ticketOwnerPhone");
const ticketOwnerAddress = document.getElementById("ticketOwnerAddress");
const boatWarrantyStartGroup = document.getElementById("boatWarrantyStartGroup");
const boatWarrantyEndGroup = document.getElementById("boatWarrantyEndGroup");
const existingBoatForm = document.getElementById("existingBoatForm");
const existingBoatSelect = document.getElementById("existingBoatSelect");
const newBoatForm = document.getElementById("newBoatForm");
const showExistingBoatButton = document.getElementById("showExistingBoatButton");
const showNewBoatButton = document.getElementById("showNewBoatButton");

const categorie = {
    problema_tecnico: "Problema tecnico",
    accesso_account: "Accesso all'account",
    fatturazione: "Fatturazione",
    informazioni: "Richiesta di informazioni",
    altro: "Altro"
};

const stati = {
    aperto: "Aperto",
    in_lavorazione: "In lavorazione",
    risolto: "Risolto",
    chiuso: "Chiuso"
};

const tipiRichiesta = {
    garanzia: "Garanzia",
    ricambi: "Ricambi",
    servizio: "Servizio"
};

const coperture = {
    da_valutare: "Da valutare",
    in_garanzia: "In garanzia",
    fuori_garanzia: "Fuori garanzia"
};

const priorita = {
    bassa: "Bassa",
    media: "Media",
    alta: "Alta",
    urgente: "Urgente"
};

const tipiDocumento = {
    preventivo: "Preventivo",
    proforma: "Fattura proforma",
    ordine_fornitore: "Ordine al fornitore",
    ddt_fornitore: "DDT del fornitore",
    ddt_cliente: "DDT cliente",
    documento_corriere: "Documento del corriere",
    conferma_pagamento: "Conferma di pagamento",
    altro: "Documento interno"
};

const operatorActions = document.getElementById("operatorActions");
const statusForm = document.getElementById("statusForm");
const statusSelect = document.getElementById("statusSelect");
const statusMessage = document.getElementById("statusMessage");
const managementForm = document.getElementById("managementForm");
const coverageSelect = document.getElementById("coverageSelect");
const prioritySelect = document.getElementById("prioritySelect");
const ticketCostInput = document.getElementById("ticketCostInput");
const addCommercialItemButton =
    document.getElementById(
        "addCommercialItemButton"
    );

const commercialItemsList =
    document.getElementById(
        "commercialItemsList"
    );

const shippingFeeInput =
    document.getElementById(
        "shippingFeeInput"
    );

const articlesSubtotal =
    document.getElementById(
        "articlesSubtotal"
    );

const commercialTotal =
    document.getElementById(
        "commercialTotal"
    );
const managementMessage = document.getElementById("managementMessage");
const assignmentForm = document.getElementById("assignmentForm");
const operatorSelect = document.getElementById("operatorSelect");
const assignmentMessage = document.getElementById("assignmentMessage");
const consultationSection =
    document.getElementById("consultationSection");

const consultationForm =
    document.getElementById("consultationForm");

const consultantSelect =
    document.getElementById("consultantSelect");

const consultationRequest =
    document.getElementById("consultationRequest");

const consultationMessage =
    document.getElementById("consultationMessage");

const consultationList =
    document.getElementById("consultationList");
const uploadRicLink = document.getElementById("uploadRicLink");
const ricList = document.getElementById("ricList");
const ricMessage = document.getElementById("ricMessage");
const uploadDocumentLink = document.getElementById("uploadDocumentLink");
const commercialCostsSection =
    document.getElementById(
        "commercialCostsSection"
    );

const causaliRic = {
    garanzia: "Materiali in garanzia",
    trasferta: "Materiali per trasferta",
    ricambio: "Ricambio",
    altro: "Altro"
};

let currentTicketId = null;

function escapeHtml(testo) {
    const elemento = document.createElement("div");
    elemento.textContent = testo;
    return elemento.innerHTML;
}

function formatDate(data) {
    return new Date(data).toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatDateOnly(data) {
    if (!data) {
        return "Non indicata";
    }

    return new Date(data).toLocaleDateString(
        "it-IT",
        {
            timeZone: "UTC"
        }
    );
}

function formatCost(costo) {
    if (costo === null || costo === undefined) {
        return "Non definito";
    }

    return Number(costo).toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR"
    });
}

function createFeedbackCard(commento) {
    const dataModifica =
        commento.updated_at
            ? `<span class="feedback-edited">
                   Modificato
               </span>`
            : "";

    const azioni =
        commento.modificabile
            ? `
                <div class="feedback-actions">
                    <button
                        class="feedback-edit-button"
                        type="button"
                        data-comment-id="${commento.id}"
                        data-comment-text="${encodeURIComponent(
                commento.testo
            )}"
                    >
                        Modifica
                    </button>

                    <button
                        class="feedback-delete-button"
                        type="button"
                        data-comment-id="${commento.id}"
                    >
                        Elimina
                    </button>
                </div>
            `
            : "";

    return `
        <article class="feedback-card">
            <div class="feedback-card-heading">
                <strong>
                    ${escapeHtml(commento.utente_nome)}
                    ${escapeHtml(commento.utente_cognome)}
                </strong>

                <time>
                    ${formatDate(commento.created_at)}
                </time>
            </div>

            <p>${escapeHtml(commento.testo)}</p>

            ${dataModifica}
            ${azioni}
        </article>
    `;
}

async function loadComments(ticketId) {
    try {
        const response = await fetch(
            `/api/tickets/${ticketId}/comments`
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        const commenti = Array.isArray(
            risultato.commenti
        )
            ? risultato.commenti
            : [];

        const feedbackCliente = commenti.filter(
            (commento) =>
                commento.tipo_feedback === "cliente"
        );

        const feedbackOperatore = commenti.filter(
            (commento) =>
                commento.tipo_feedback === "operatore"
        );

        customerFeedbackList.innerHTML =
            feedbackCliente
                .map(createFeedbackCard)
                .join("");

        operatorFeedbackList.innerHTML =
            feedbackOperatore
                .map(createFeedbackCard)
                .join("");
    } catch (error) {
        commentsMessage.textContent =
            error.message;

        commentsMessage.className =
            "form-message error-message";
    }
}

async function loadOperators(
    assignedOperatorId = null
) {
    try {
        const response =
            await fetch("/api/operators");

        const risultato =
            await response.json();

        if (!response.ok) {
            throw new Error(
                risultato.message ||
                "Impossibile caricare gli operatori"
            );
        }

        /*
         * ASSEGNAZIONE
         * Qui devono comparire solamente gli operatori
         * del reparto After Sales.
         */
        const operatoriAfterSales =
            risultato.operatori_after_sales ||
            risultato.operatori ||
            [];

        operatorSelect.innerHTML = `
            <option value="">
                Seleziona un operatore After Sales
            </option>
        `;

        operatoriAfterSales.forEach((operatore) => {
            const opzione =
                document.createElement("option");

            opzione.value = operatore.id;

            opzione.textContent =
                opzione.textContent =
                `${operatore.nome} ${operatore.cognome}`;;

            operatorSelect.appendChild(opzione);
        });

        if (assignedOperatorId) {
            operatorSelect.value =
                String(assignedOperatorId);
        }

        /*
         * CONSULTAZIONE
         * Qui compaiono gli operatori interni che
         * non appartengono all’After Sales.
         */
        const consulenti =
            Array.isArray(risultato.consulenti)
                ? risultato.consulenti
                : [];

        consultantSelect.innerHTML = `
            <option value="">
                Seleziona reparto o collaboratore
            </option>
        `;

        consulenti.forEach((consulente) => {
            const opzione =
                document.createElement("option");

            opzione.value = consulente.id;

            const funzione =
                consulente.funzione
                    ? ` — ${consulente.funzione}`
                    : "";

            opzione.textContent =
                `${consulente.nome} ` +
                `${consulente.cognome}` +
                funzione;

            consultantSelect.appendChild(opzione);
        });
    } catch (error) {
        assignmentMessage.textContent =
            error.message;

        assignmentMessage.className =
            "form-message error-message";

        consultationMessage.textContent =
            error.message;

        consultationMessage.className =
            "form-message error-message";
    }
}

async function loadConsultations(ticketId) {
    try {
        const response = await fetch(
            `/api/tickets/${ticketId}/consultations`
        );

        const risultato =
            await response.json();

        if (!response.ok) {
            throw new Error(
                risultato.message ||
                "Impossibile caricare le consultazioni"
            );
        }

        consultationSection.hidden = false;

        /*
         * Solo il Main Operator può creare
         * una nuova consultazione.
         */
        consultationForm.hidden =
            !risultato.main_operator;

        const consultazioni =
            Array.isArray(risultato.consultazioni)
                ? risultato.consultazioni
                : [];

        if (consultazioni.length === 0) {
            consultationList.innerHTML = "";
            return;
        }

        consultationList.innerHTML =
            consultazioni.map((consultazione) => {
                const nomeConsulente =
                    `${consultazione.consulente_nome} ` +
                    `${consultazione.consulente_cognome}`;

                const funzione =
                    consultazione.consulente_funzione
                        ? escapeHtml(
                            consultazione.consulente_funzione
                        )
                        : "Collaboratore interno";

                const allegati =
                    Array.isArray(consultazione.allegati)
                        ? consultazione.allegati
                        : [];

                const tecnicoProprietario =
                    !risultato.main_operator &&
                    Number(risultato.utente_id) ===
                    Number(consultazione.consulente_id);

                const risposta =
                    consultazione.risposta
                        ? `
            <div class="consultation-response">
                <div class="consultation-response-heading">
                    <span>Risposta tecnica</span>
                </div>

                <p>
                    ${escapeHtml(
                            consultazione.risposta
                        )}
                </p>

                ${allegati.length > 0
                            ? `
                            <div class="consultation-attachments">
                                <span class="consultation-attachments-title">
                                    Allegati
                                </span>

                                ${allegati.map((allegato) => `
                                    <div class="consultation-attachment">
                                        <a
                                            href="/api/tickets/consultation-attachments/${allegato.id}/view"
                                            target="_blank"
                                            rel="noopener"
                                        >
                                            📎 ${escapeHtml(
                                allegato.nome_originale
                            )}
                                        </a>

                                        ${tecnicoProprietario
                                    ? `
                                                    <button
                                                        type="button"
                                                        class="consultation-attachment-delete"
                                                        data-action="delete-consultation-attachment"
                                                        data-attachment-id="${allegato.id}"
                                                        data-consultation-id="${consultazione.id}"
                                                        title="Elimina allegato"
                                                        aria-label="Elimina allegato"
                                                    >
                                                        🗑
                                                    </button>
                                                `
                                    : ""
                                }
                                    </div>
                                `).join("")}
                            </div>
                        `
                            : ""
                        }

                ${tecnicoProprietario
                            ? `
                            <div class="consultation-response-actions">
                                <button
                                    type="button"
                                    class="button consultation-edit-button"
                                    data-action="edit-consultation-response"
                                    data-consultation-id="${consultazione.id}"
                                >
                                    Modifica
                                </button>

                                <button
                                    type="button"
                                    class="button consultation-delete-button"
                                    data-action="delete-consultation-response"
                                    data-consultation-id="${consultazione.id}"
                                >
                                    Elimina
                                </button>
                            </div>
                        `
                            : ""
                        }
            </div>
        `
                        : "";

                const deveMostrareModulo =
                    tecnicoProprietario &&
                    (
                        consultazione.stato === "richiesta" ||
                        consultazione.stato === "risposta_ricevuta"
                    );

                const moduloRisposta =
                    deveMostrareModulo
                        ? `
            <form
                class="consultation-response-form"
                data-consultation-id="${consultazione.id}"
                ${consultazione.risposta
                            ? "hidden"
                            : ""
                        }
            >
                <label class="consultation-response-label">
                    ${consultazione.risposta
                            ? "Modifica risposta tecnica"
                            : "Risposta tecnica"
                        }
                </label>

                <textarea
                    name="risposta"
                    rows="6"
                    maxlength="3000"
                    placeholder="Inserisci la valutazione tecnica..."
                >${escapeHtml(
                            consultazione.risposta || ""
                        )}</textarea>

                <div class="consultation-response-toolbar">
                    <label class="consultation-attachment-button">
                        <span aria-hidden="true">📎</span>
                        <span>Aggiungi allegati</span>

                        <input
                            class="consultation-attachment-input"
                            type="file"
                            name="allegati"
                            multiple
                            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.zip"
                        >
                    </label>

                    <button
                        class="button button-primary button-small"
                        type="submit"
                    >
                        ${consultazione.risposta
                            ? "Salva modifiche"
                            : "Invia risposta"
                        }
                    </button>

                    ${consultazione.risposta
                            ? `
                                <button
                                    type="button"
                                    class="button consultation-cancel-edit"
                                    data-action="cancel-consultation-response-edit"
                                    data-consultation-id="${consultazione.id}"
                                >
                                    Annulla
                                </button>
                            `
                            : ""
                        }
                </div>

                <div
                    class="consultation-selected-files"
                    aria-live="polite"
                ></div>

                <small class="consultation-upload-help">
                    Foto, video o documenti · massimo 8 file
                </small>
            </form>
        `
                        : "";
                const azioniConsultazione =
                    risultato.main_operator &&
                        consultazione.stato === "richiesta"
                        ? `
            <div class="consultation-actions">
                <button
                    type="button"
                    class="button consultation-edit-button"
                    data-action="edit-consultation"
                    data-consultation-id="${consultazione.id}"
                    data-request="${escapeHtml(
                            consultazione.richiesta
                        )}"
                >
                    Modifica
                </button>

                <button
                    type="button"
                    class="button consultation-delete-button"
                    data-action="delete-consultation"
                    data-consultation-id="${consultazione.id}"
                >
                    Elimina
                </button>
            </div>
        `
                        : "";
                return `
                    <article class="consultation-card">
                        <div class="consultation-card-heading">
                            <div>
                                <span class="consultation-role">
                                    ${funzione}
                                </span>

                                <h3>
                                    ${escapeHtml(nomeConsulente)}
                                </h3>
                            </div>

                            <span class="consultation-status">
                                ${escapeHtml(
                    consultazione.stato
                )}
                            </span>
                        </div>

                        <div class="consultation-request">
                            <span>Richiesta</span>

                            <p>
                                ${escapeHtml(
                    consultazione.richiesta
                )}
                            </p>
                        </div>

                        ${azioniConsultazione}
${risposta}
${moduloRisposta}
                    </article>
                `;
            }).join("");
    } catch (error) {
        consultationMessage.textContent =
            error.message;

        consultationMessage.className =
            "form-message error-message";
    }
}

async function loadHistory(ticketId, ticket) {
    historyMessage.textContent = "";

    const ordineStati = [
        "aperto",
        "in_lavorazione",
        "risolto",
        "chiuso"
    ];

    const indiceStatoAttuale =
        ordineStati.indexOf(ticket.stato);

    let modifiche = [];

    try {
        const response = await fetch(
            `/api/tickets/${ticketId}/history`
        );

        const risultato = await response.json();

        if (response.ok) {
            modifiche = Array.isArray(risultato.storico)
                ? risultato.storico
                : [];
        }
    } catch (error) {
        console.error(
            "Errore caricamento storico:",
            error
        );
    }

    const roadmap = ordineStati
        .map((stato, indice) => {
            let classe = "roadmap-future";
            let descrizione = "Fase non ancora raggiunta";

            if (indice < indiceStatoAttuale) {
                classe = "roadmap-completed";
                descrizione = "Fase completata";
            }

            if (indice === indiceStatoAttuale) {
                classe = "roadmap-current";
                descrizione = "Stato attuale del ticket";
            }

            return `
                <div class="roadmap-step ${classe}">
                    <span class="roadmap-marker">
                        ${indice <= indiceStatoAttuale ? "✓" : indice + 1}
                    </span>

                    <div>
                        <strong>${stati[stato]}</strong>
                        <small>${descrizione}</small>
                    </div>
                </div>
            `;
        })
        .join("");

    const apertura = `
        <article class="history-item history-opening">
            <div class="history-marker"></div>

            <div class="history-content">
                <p>
                    <strong>Ticket aperto</strong>
                </p>

                <small>
                    Richiesta registrata il
                    ${formatDate(ticket.created_at)}
                </small>
            </div>
        </article>
    `;

    const cambiamenti = modifiche
        .filter((modifica) => {
            return !(
                modifica.stato_precedente === null &&
                modifica.stato_nuovo === "aperto"
            );
        })
        .map((modifica) => {
            const statoPrecedente =
                stati[modifica.stato_precedente] ||
                "Aperto";

            const statoNuovo =
                stati[modifica.stato_nuovo] ||
                modifica.stato_nuovo;

            const operatore =
                modifica.operatore_nome
                    ? `${modifica.operatore_nome} ${modifica.operatore_cognome}`
                    : "Sistema";

            return `
                <article class="history-item">
                    <div class="history-marker"></div>

                    <div class="history-content">
                        <p>
                            <strong>
                                ${escapeHtml(statoPrecedente)}
                            </strong>

                            <span>→</span>

                            <strong>
                                ${escapeHtml(statoNuovo)}
                            </strong>
                        </p>

                        <small>
                            Aggiornato da
                            <strong>
                                ${escapeHtml(operatore)}
                            </strong>
                            il
                            ${formatDate(modifica.created_at)}
                        </small>
                    </div>
                </article>
            `;
        })
        .join("");

    historyList.innerHTML = `
        <div class="ticket-roadmap">
            ${roadmap}
        </div>

        <div class="ticket-history-events">
            ${apertura}
            ${cambiamenti}
        </div>
    `;
}

async function loadDocuments(ticketId, ruoloUtente) {
    try {
        const response = await fetch(
            `/api/documents/ticket/${ticketId}`
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        if (risultato.documenti.length === 0) {
            ticketDocumentsList.innerHTML = "";
            return;
        }

        ticketDocumentsList.innerHTML =
            risultato.documenti
                .map((documento) => {
                    const visibileCliente =
                        Boolean(documento.visibile_cliente);

                    const etichettaVisibilita =
                        visibileCliente
                            ? "Visibile al cliente"
                            : "Interno";

                    const classeVisibilita =
                        visibileCliente
                            ? "public-badge"
                            : "internal-badge";

                    const numeroCompleto = [
                        documento.serie_documento,
                        documento.numero_documento
                    ]
                        .filter(Boolean)
                        .join(" ");

                    const operatore =
                        documento.operatore_nome
                            ? `${documento.operatore_nome} ${documento.operatore_cognome}`
                            : "Operatore non disponibile";

                    const dataDocumento =
                        documento.data_documento
                            ? formatDate(
                                documento.data_documento
                            )
                            : "Non indicata";

                    const noteHtml =
                        documento.note
                            ? `
                                <div>
                                    <dt>Note</dt>
                                    <dd>
                                        ${escapeHtml(documento.note)}
                                    </dd>
                                </div>
                            `
                            : "";

                    return `
                        <article class="document-card">
                            <div class="document-card-header">
                                <div>
                                    <span class="document-type">
                                        ${escapeHtml(
                        tipiDocumento[
                        documento.tipo
                        ] || documento.tipo
                    )}
                                    </span>

                                    <h3>
                                        ${numeroCompleto
                            ? escapeHtml(
                                numeroCompleto
                            )
                            : "Senza numero"
                        }
                                    </h3>
                                </div>

                                <span class="${classeVisibilita}">
                                    ${etichettaVisibilita}
                                </span>
                            </div>

                            <dl class="document-information">
                                <div>
                                    <dt>Data documento</dt>
                                    <dd>${dataDocumento}</dd>
                                </div>

                                <div>
                                    <dt>Nome file</dt>
                                    <dd>
                                        ${escapeHtml(
                            documento.nome_file_originale
                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt>Dimensione</dt>
                                    <dd>
                                        ${formatFileSize(
                            documento.dimensione_file
                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt>Caricato da</dt>
                                    <dd>${escapeHtml(operatore)}</dd>
                                </div>

                                ${noteHtml}
                            </dl>

                            <div class="document-actions">
                                <a
                                    class="button button-small"
                                    href="/api/documents/${documento.id}/view"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    Visualizza
                                </a>

                                <a
                                    class="button button-primary button-small"
                                    href="/api/documents/${documento.id}/download"
                                >
                                    Scarica
                                </a>
                            </div>
                        </article>
                    `;
                })
                .join("");
    } catch (error) {
        ticketDocumentsList.innerHTML = "";

        documentsMessage.textContent = error.message;

        documentsMessage.className =
            "form-message error-message";
    }
}

async function loadAttachments(ticketId) {
    try {
        const response = await fetch(
            `/api/tickets/${ticketId}/attachments`
        );

        const risultato = await response.json();

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        const allegati = Array.isArray(risultato.allegati)
            ? risultato.allegati
            : [];

        const fotoVideo = allegati.filter(
            (allegato) =>
                allegato.tipo === "foto" ||
                allegato.tipo === "video"
        );

        const documentiCliente = allegati.filter(
            (allegato) =>
                allegato.tipo === "documento"
        );

        ticketAttachmentsSection.hidden =
            fotoVideo.length === 0;

        ticketAttachmentsList.innerHTML =
            fotoVideo
                .map(creaSchedaAllegato)
                .join("");

        clientDocumentsList.innerHTML =
            documentiCliente
                .map(creaSchedaAllegato)
                .join("");

    } catch (error) {
        ticketAttachmentsSection.hidden = true;
        ticketAttachmentsList.innerHTML = "";

        clientDocumentsList.innerHTML = `
            <div class="client-documents-ready">
                <p>
                    Non è stato possibile caricare i documenti.
                </p>
            </div>
        `;

        clientDocumentsMessage.textContent =
            error.message;

        clientDocumentsMessage.className =
            "form-message error-message";
    }
}

function creaSchedaAllegato(allegato) {
    const url =
        `/api/tickets/attachments/${allegato.id}/view`;

    const nomeFile =
        allegato.nome_file_originale ||
        "Documento";

    const estensione =
        nomeFile.includes(".")
            ? nomeFile
                .split(".")
                .pop()
                .toUpperCase()
                .slice(0, 4)
            : "FILE";

    const eliminaButton =
        allegato.eliminabile
            ? `
            <button
                class="attachment-icon-button attachment-delete-button"
                type="button"
                data-attachment-id="${allegato.id}"
                aria-label="Elimina allegato"
                title="Elimina"
            >
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"
                    />
                </svg>
            </button>
        `
            : "";

    if (allegato.tipo === "documento") {
        return `
        <article
            class="client-document-row"
            data-attachment-id="${allegato.id}"
        >
            <a
                class="client-document-title"
                href="attachment-detail.html?ticket_id=${currentTicketId}&attachment_id=${allegato.id}"
            >
                ${escapeHtml(nomeFile)}
            </a>
        </article>
    `;
    }

    let anteprima = "";

    if (allegato.tipo === "foto") {
        anteprima = `
            <img
                src="${url}"
                alt="Foto allegata al ticket"
                loading="lazy"
            >
        `;
    } else if (allegato.tipo === "video") {
        anteprima = `
            <video controls preload="metadata">
                <source
                    src="${url}"
                    type="${escapeHtml(allegato.mime_type)}"
                >
            </video>
        `;
    }

    return `
        <article class="ticket-attachment-card">
            ${anteprima}

          <div class="attachment-actions">
    <a
        class="attachment-icon-button"
        href="${url}"
        target="_blank"
        rel="noopener"
        aria-label="Visualizza allegato"
        title="Visualizza"
    >
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
            />
            <circle cx="12" cy="12" r="2.8" />
        </svg>
    </a>

    <a
        class="attachment-icon-button"
        href="${url}"
        download="${escapeHtml(nomeFile)}"
        aria-label="Scarica allegato"
        title="Scarica"
    >
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M12 3v12m-5-5 5 5 5-5M5 20h14"
            />
        </svg>
    </a>

    ${eliminaButton}
</div>
        </article>
    `;
}

async function gestisciEliminazioneAllegato(event) {
    const deleteButton = event.target.closest(
        ".attachment-delete-button"
    );

    if (!deleteButton) {
        return;
    }

    const attachmentId =
        deleteButton.dataset.attachmentId;

    const conferma = window.confirm(
        "Vuoi eliminare definitivamente questo documento?"
    );

    if (!conferma) {
        return;
    }

    deleteButton.disabled = true;

    try {
        const response = await fetch(
            `/api/tickets/attachments/${attachmentId}`,
            {
                method: "DELETE"
            }
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        const schedaDocumento =
            deleteButton.closest(
                ".client-document-row, .ticket-attachment-card"
            );

        if (schedaDocumento) {
            schedaDocumento.remove();
        }

        clientDocumentsMessage.textContent =
            risultato.message;

        clientDocumentsMessage.className =
            "form-message success-message";

        await loadAttachments(currentTicketId);
    } catch (error) {
        clientDocumentsMessage.textContent =
            error.message;

        clientDocumentsMessage.className =
            "form-message error-message";

        deleteButton.disabled = false;
    }
}

ticketAttachmentsList.addEventListener(
    "click",
    gestisciEliminazioneAllegato
);

clientDocumentsList.addEventListener(
    "click",
    gestisciEliminazioneAllegato
);

additionalAttachmentsForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const files = Array.from(
            additionalAttachments.files
        );

        if (files.length === 0) {
            attachmentsMessage.textContent =
                "Seleziona almeno una foto o un video";

            attachmentsMessage.className =
                "form-message error-message";

            return;
        }

        const contieneFileNonValido = files.some(
            (file) =>
                !file.type.startsWith("image/") &&
                !file.type.startsWith("video/") &&
                file.type !== "application/pdf"
        );

        if (contieneFileNonValido) {
            attachmentsMessage.textContent =
                "Puoi caricare solamente foto, video o documenti PDF";

            attachmentsMessage.className =
                "form-message error-message";

            return;
        }

        const formData = new FormData();

        files.forEach((file) => {
            formData.append("allegati", file);
        });

        uploadAttachmentsButton.disabled = true;

        attachmentsMessage.textContent =
            "Caricamento in corso...";

        attachmentsMessage.className =
            "form-message";

        try {
            const response = await fetch(
                `/api/tickets/${currentTicketId}/attachments`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const risultato = await response.json();

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            if (!response.ok) {
                throw new Error(risultato.message);
            }

            attachmentsMessage.textContent =
                risultato.message;

            attachmentsMessage.className =
                "form-message success-message";

            additionalAttachmentsForm.reset();

            await loadAttachments(currentTicketId);
        } catch (error) {
            attachmentsMessage.textContent =
                error.message;

            attachmentsMessage.className =
                "form-message error-message";
        } finally {
            uploadAttachmentsButton.disabled = false;
        }
    }
);

clientDocumentsForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const files = Array.from(
            clientDocuments.files
        );

        if (files.length === 0) {
            clientDocumentsMessage.textContent =
                "Seleziona almeno un documento.";

            clientDocumentsMessage.className =
                "form-message error-message";

            return;
        }

        const formData = new FormData();

        formData.append(
            "categoria_allegato",
            "documento_cliente"
        );

        files.forEach((file) => {
            formData.append("allegati", file);
        });

        uploadClientDocumentsButton.disabled = true;

        clientDocumentsMessage.textContent =
            "Caricamento dei documenti in corso...";

        clientDocumentsMessage.className =
            "form-message";

        try {
            const response = await fetch(
                `/api/tickets/${currentTicketId}/attachments`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const risultato =
                await response.json();

            if (response.status === 401) {
                window.location.href = "login.html";
                return;
            }

            if (!response.ok) {
                throw new Error(
                    risultato.message ||
                    "Caricamento non riuscito"
                );
            }

            clientDocumentsMessage.textContent =
                risultato.message;

            clientDocumentsMessage.className =
                "form-message success-message";

            clientDocumentsForm.reset();

            await loadAttachments(currentTicketId);
        } catch (error) {
            clientDocumentsMessage.textContent =
                error.message;

            clientDocumentsMessage.className =
                "form-message error-message";
        } finally {
            uploadClientDocumentsButton.disabled =
                false;
        }
    }
);

async function loadCustomerBoats(customerId) {
    try {
        const response = await fetch(
            `/api/boats?cliente_id=` +
            `${encodeURIComponent(customerId)}`
        );

        const risultato =
            await response.json();

        if (!response.ok) {
            throw new Error(
                risultato.message
            );
        }

        existingBoatSelect.innerHTML = `
            <option value="">
                Seleziona la barca
            </option>
        `;

        risultato.barche.forEach((barca) => {
            const option =
                document.createElement("option");

            option.value =
                barca.id;

            option.textContent =
                `${barca.modello} — ${barca.matricola}`;

            existingBoatSelect.appendChild(
                option
            );
        });
    } catch (error) {
        ticketBoatAssignmentMessage.textContent =
            error.message;

        ticketBoatAssignmentMessage.className =
            "form-message error-message";
    }
}

async function loadTicketDetail() {
    const parametri = new URLSearchParams(window.location.search);
    const ticketId = parametri.get("id");

    if (!ticketId) {
        ticketDetail.hidden = true;
        commentsSection.hidden = true;
        message.textContent = "Identificativo del ticket mancante";
        message.className = "form-message error-message";
        return;
    }

    currentTicketId = ticketId;

    try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        const risultato = await response.json();

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        const ticket = risultato.ticket;

        await loadHistory(ticketId, ticket);

        uploadDocumentLink.href =
            `upload-document.html?ticket_id=${ticket.id}`;

        uploadRicLink.href =
            `upload-ric.html?ticket_id=${ticket.id}`;

        const userResponse =
            await fetch("/api/auth/me");

        const userResult =
            await userResponse.json();

        if (
            userResponse.ok &&
            userResult.utente.ruolo === "operatore"
        ) {
            operatorActions.hidden = false;
            commercialCostsSection.hidden = false;
            operatorRicArchive.hidden = false;
            documentUploadSection.hidden = false;

            statusSelect.value = ticket.stato;
            prioritySelect.value =
                ticket.priorita ?? "media";
            coverageSelect.value =
                ticket.copertura ?? "da_valutare";
            ticketCostInput.value =
                ticket.costo ?? "";

            await loadOperators(ticket.operatore_id);
            await loadRics(ticket.id);
        }

        /*
         * Le consultazioni vengono caricate sia
         * dall'operatore sia dal tecnico consultato.
         */
        if (
            userResponse.ok &&
            (
                userResult.utente.ruolo === "operatore" ||
                userResult.utente.ruolo === "tecnico"
            )
        ) {
            await loadConsultations(ticket.id);
        }
        await loadDocuments(ticket.id, userResult.utente.ruolo);

        ticketNumber.textContent = `Ticket #${ticket.id}`;
        ticketStatus.textContent = stati[ticket.stato];
        ticketStatus.className = `ticket-status status-${ticket.stato}`;
        ticketTitle.textContent = ticket.titolo;
        ticketDescription.textContent = ticket.descrizione;
        await loadAttachments(ticketId);
        ticketCategory.textContent = categorie[ticket.categoria];
        ticketStateText.textContent = stati[ticket.stato];
        ticketPriority.textContent = priorita[ticket.priorita] ?? "Media";
        ticketCreatedAt.textContent = formatDate(ticket.created_at);

        ticketOwner.textContent =
            `${ticket.utente_nome} ${ticket.utente_cognome}`;

        ticketOwnerEmail.textContent =
            ticket.utente_email ||
            "Email non disponibile";

        ticketOwnerPhone.textContent =
            ticket.utente_telefono ||
            "Telefono non disponibile";

        ticketOwnerAddress.textContent =
            ticket.utente_indirizzo_residenza ||
            "Indirizzo non disponibile";

        ticketAssignedOperator.textContent =
            ticket.operatore_id
                ? `${ticket.operatore_nome} ${ticket.operatore_cognome}`
                : "Non assegnato";

        ticketRequestType.textContent =
            tipiRichiesta[ticket.tipo_richiesta] ??
            "Non indicato";

        ticketCoverage.textContent =
            coperture[ticket.copertura] ??
            "Da valutare";

        ticketCost.textContent =
            formatCost(ticket.costo);

        if (ticket.barca_id) {
            ticketBoatSection.hidden = false;
            ticketBoatMissingSection.hidden = true;

            boatModel.textContent =
                ticket.barca_modello ||
                "Modello non disponibile";

            boatRegistration.textContent =
                ticket.barca_matricola ||
                "Matricola non disponibile";

            boatProductionYear.textContent =
                ticket.barca_anno_produzione ||
                "Anno non disponibile";

            boatLocation.textContent =
                ticket.barca_localizzazione ||
                "Localizzazione non disponibile";

            boatDeliveryAddress.textContent =
                ticket.barca_indirizzo_consegna ||
                "Indirizzo non disponibile";

            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0);

            const scadenzaGaranzia =
                ticket.garanzia_scadenza_il
                    ? new Date(ticket.garanzia_scadenza_il)
                    : null;

            if (scadenzaGaranzia) {
                scadenzaGaranzia.setHours(0, 0, 0, 0);
            }

            const garanziaAttiva =
                scadenzaGaranzia &&
                scadenzaGaranzia >= oggi;

            boatWarrantyStatus.hidden = false;

            boatWarrantyStatus.textContent =
                garanziaAttiva
                    ? "In garanzia"
                    : "Fuori garanzia";

            boatWarrantyStatus.className =
                garanziaAttiva
                    ? "warranty-badge warranty-active"
                    : "warranty-badge warranty-expired";

            if (garanziaAttiva) {
                boatWarrantyStartGroup.hidden = false;
                boatWarrantyEndGroup.hidden = false;

                boatWarrantyStart.textContent =
                    formatDateOnly(
                        ticket.garanzia_attivata_il
                    );

                boatWarrantyEnd.textContent =
                    formatDateOnly(
                        ticket.garanzia_scadenza_il
                    );
            } else {
                boatWarrantyStartGroup.hidden = true;
                boatWarrantyEndGroup.hidden = true;
            }
        } else {
            ticketBoatSection.hidden = true;
            ticketBoatMissingSection.hidden = false;

            await loadCustomerBoats(
                ticket.utente_id
            );
        }

        await loadComments(ticketId);
    } catch (error) {
        ticketDetail.hidden = true;
        commentsSection.hidden = true;

        message.textContent =
            error.message;

        message.className =
            "form-message error-message";
    }
}

async function editFeedback(button) {
    const commentId =
        button.dataset.commentId;

    const testoAttuale =
        decodeURIComponent(
            button.dataset.commentText
        );

    const nuovoTesto = window.prompt(
        "Modifica il feedback:",
        testoAttuale
    );

    if (
        nuovoTesto === null ||
        nuovoTesto.trim() === testoAttuale.trim()
    ) {
        return;
    }

    try {
        const response = await fetch(
            `/api/tickets/${currentTicketId}` +
            `/comments/${commentId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    testo: nuovoTesto
                })
            }
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        await loadComments(currentTicketId);
    } catch (error) {
        commentsMessage.textContent =
            error.message;

        commentsMessage.className =
            "form-message error-message";
    }
}

async function deleteFeedback(button) {
    const conferma = window.confirm(
        "Vuoi eliminare questo feedback?"
    );

    if (!conferma) {
        return;
    }

    const commentId =
        button.dataset.commentId;

    try {
        const response = await fetch(
            `/api/tickets/${currentTicketId}` +
            `/comments/${commentId}`,
            {
                method: "DELETE"
            }
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        button.closest(".feedback-card")?.remove();

        await loadComments(currentTicketId);
    } catch (error) {
        commentsMessage.textContent =
            error.message;

        commentsMessage.className =
            "form-message error-message";
    }
}

commentsSection.addEventListener(
    "click",
    (event) => {
        const editButton = event.target.closest(
            ".feedback-edit-button"
        );

        if (editButton) {
            editFeedback(editButton);
            return;
        }

        const deleteButton = event.target.closest(
            ".feedback-delete-button"
        );

        if (deleteButton) {
            deleteFeedback(deleteButton);
        }
    }
);

commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    commentsMessage.textContent = "Invio del commento in corso...";
    commentsMessage.className = "form-message";

    try {
        const response = await fetch(
            `/api/tickets/${currentTicketId}/comments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    testo: commentText.value
                })
            }
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        commentsMessage.textContent = risultato.message;
        commentsMessage.className = "form-message success-message";
        commentForm.reset();

        await loadComments(currentTicketId);
    } catch (error) {
        commentsMessage.textContent = error.message;
        commentsMessage.className = "form-message error-message";
    }
});

statusForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    statusMessage.textContent =
        "Aggiornamento dello stato in corso...";

    statusMessage.className = "form-message";

    try {
        const response = await fetch(
            `/api/tickets/${currentTicketId}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    stato: statusSelect.value
                })
            }
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        const nuovoStato = risultato.ticket.stato;

        ticketStatus.textContent = stati[nuovoStato];
        ticketStatus.className = `ticket-status status-${nuovoStato}`;
        ticketStateText.textContent = stati[nuovoStato];
        statusMessage.textContent = risultato.message;
        statusMessage.className = "form-message success-message";
    } catch (error) {
        statusMessage.textContent = error.message;
        statusMessage.className = "form-message error-message";
    }
});

function formatCommercialCost(value) {
    return new Intl.NumberFormat(
        "it-IT",
        {
            style: "currency",
            currency: "EUR"
        }
    ).format(Number(value) || 0);
}

function calculateCommercialTotal() {
    const righe =
        commercialItemsList.querySelectorAll(
            ".commercial-item-row"
        );

    let totaleArticoli = 0;

    righe.forEach((riga) => {
        const costo =
            Number(
                riga.querySelector(
                    ".commercial-item-cost"
                ).value
            ) || 0;

        const quantita =
            Number(
                riga.querySelector(
                    ".commercial-item-quantity"
                ).value
            ) || 1;

        totaleArticoli += costo * quantita;
    });

    const shippingFee =
        Number(shippingFeeInput.value) || 0;

    const totaleComplessivo =
        totaleArticoli + shippingFee;

    articlesSubtotal.textContent =
        formatCommercialCost(totaleArticoli);

    commercialTotal.textContent =
        formatCommercialCost(
            totaleComplessivo
        );

    ticketCostInput.value =
        totaleComplessivo.toFixed(2);
}

function addCommercialItemRow(item = {}) {
    const riga =
        document.createElement("div");

    riga.className =
        "commercial-item-row";

    riga.innerHTML = `
        <div class="form-group">
            <label>Codice articolo</label>

            <input
                class="commercial-item-code"
                type="text"
                maxlength="100"
                value="${escapeHtml(
        item.codice_articolo || ""
    )}"
                placeholder="Esempio: 051370P"
                required
            >
        </div>

        <div class="form-group commercial-description">
            <label>Descrizione articolo</label>

            <input
                class="commercial-item-description"
                type="text"
                maxlength="500"
                value="${escapeHtml(
        item.descrizione_articolo || ""
    )}"
                placeholder="Descrizione dell’articolo"
                required
            >
        </div>

        <div class="form-group">
            <label>Costo per articolo (€)</label>

            <input
                class="commercial-item-cost"
                type="number"
                min="0"
                step="0.01"
                value="${item.costo_articolo ?? ""}"
                placeholder="0.00"
                required
            >
        </div>

        <div class="form-group">
            <label>Quantità</label>

            <input
                class="commercial-item-quantity"
                type="number"
                min="1"
                step="1"
                value="${item.quantita ?? 1}"
                required
            >
        </div>

        <div class="form-group">
            <label>Estimated lead time</label>

            <input
                class="commercial-item-lead-time"
                type="text"
                maxlength="150"
                value="${escapeHtml(
        item.estimated_lead_time || ""
    )}"
                placeholder="Esempio: 3–4 settimane"
            >
        </div>

        <button
            class="commercial-item-remove"
            type="button"
            title="Elimina articolo"
        >
            Elimina
        </button>
    `;

    commercialItemsList.appendChild(riga);

    calculateCommercialTotal();
}

function getCommercialItems() {
    return Array.from(
        commercialItemsList.querySelectorAll(
            ".commercial-item-row"
        )
    ).map((riga) => ({
        codice_articolo:
            riga.querySelector(
                ".commercial-item-code"
            ).value.trim(),

        descrizione_articolo:
            riga.querySelector(
                ".commercial-item-description"
            ).value.trim(),

        costo_articolo:
            Number(
                riga.querySelector(
                    ".commercial-item-cost"
                ).value
            ),

        quantita:
            Number(
                riga.querySelector(
                    ".commercial-item-quantity"
                ).value
            ),

        estimated_lead_time:
            riga.querySelector(
                ".commercial-item-lead-time"
            ).value.trim()
    }));
}

addCommercialItemButton.addEventListener(
    "click",
    () => {
        addCommercialItemRow();
    }
);

commercialItemsList.addEventListener(
    "input",
    calculateCommercialTotal
);

commercialItemsList.addEventListener(
    "click",
    (event) => {
        const removeButton =
            event.target.closest(
                ".commercial-item-remove"
            );

        if (!removeButton) {
            return;
        }

        removeButton
            .closest(".commercial-item-row")
            .remove();

        calculateCommercialTotal();
    }
);

shippingFeeInput.addEventListener(
    "input",
    calculateCommercialTotal
);

addCommercialItemRow();

managementForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        managementMessage.textContent = "Salvataggio in corso...";
        managementMessage.className = "form-message";

        const costoInserito = ticketCostInput.value.trim();
        const articoli =
            getCommercialItems();

        const shippingFee =
            Number(shippingFeeInput.value) || 0;


        try {
            const response = await fetch(
                `/api/tickets/${currentTicketId}/management`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        priorita: prioritySelect.value,
                        copertura: coverageSelect.value,
                        costo:
                            costoInserito === ""
                                ? null
                                : Number(costoInserito),
                        shipping_fee: shippingFee,
                        articoli
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
            ticketPriority.textContent = priorita[risultato.ticket.priorita];
            ticketCoverage.textContent = coperture[risultato.ticket.copertura];
            ticketCost.textContent = formatCost(
                risultato.ticket.costo);

            managementMessage.textContent =
                risultato.message;

            managementMessage.className =
                "form-message success-message";
        } catch (error) {
            managementMessage.textContent =
                error.message;

            managementMessage.className =
                "form-message error-message";
        }
    }
);

assignmentForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        assignmentMessage.textContent =
            "Assegnazione in corso...";

        assignmentMessage.className =
            "form-message";

        try {
            const response = await fetch(
                `/api/tickets/${currentTicketId}/assignment`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        operatore_id:
                            Number(operatorSelect.value)
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

            const operatore =
                risultato.ticket.operatore;

            ticketAssignedOperator.textContent =
                `${operatore.nome} ${operatore.cognome}`;

            assignmentMessage.textContent =
                risultato.message;

            assignmentMessage.className =
                "form-message success-message";

            await loadOperators(operatore.id);
        } catch (error) {
            assignmentMessage.textContent =
                error.message;

            assignmentMessage.className =
                "form-message error-message";
        }
    }
);

consultationForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const consulenteId =
            Number(consultantSelect.value);

        const richiesta =
            consultationRequest.value.trim();

        if (!consulenteId) {
            consultationMessage.textContent =
                "Seleziona un collaboratore";

            consultationMessage.className =
                "form-message error-message";

            return;
        }

        if (richiesta.length < 3) {
            consultationMessage.textContent =
                "Inserisci la richiesta da inviare";

            consultationMessage.className =
                "form-message error-message";

            return;
        }

        consultationMessage.textContent =
            "Invio della consultazione...";

        consultationMessage.className =
            "form-message";

        try {
            const response = await fetch(
                `/api/tickets/${currentTicketId}/consultations`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        consulente_id: consulenteId,
                        richiesta
                    })
                }
            );

            const risultato =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    risultato.message ||
                    "Invio della consultazione non riuscito"
                );
            }

            consultationMessage.textContent =
                risultato.message;

            consultationMessage.className =
                "form-message success-message";

            consultationForm.reset();

            await loadConsultations(
                currentTicketId
            );
        } catch (error) {
            consultationMessage.textContent =
                error.message;

            consultationMessage.className =
                "form-message error-message";
        }
    }
);

consultationList.addEventListener(
    "change",
    (event) => {
        const input = event.target.closest(
            ".consultation-attachment-input"
        );

        if (!input) {
            return;
        }

        const form = input.closest(
            ".consultation-response-form"
        );

        const selectedFiles =
            form.querySelector(
                ".consultation-selected-files"
            );

        const files =
            Array.from(input.files);

        if (files.length === 0) {
            selectedFiles.innerHTML = "";
            return;
        }

        selectedFiles.innerHTML =
            files.map((file) => `
                <div class="consultation-selected-file">
                    <span>📄</span>

                    <span>
                        ${escapeHtml(file.name)}
                    </span>
                </div>
            `).join("");
    }
);

consultationList.addEventListener(
    "submit",
    async (event) => {
        const form = event.target.closest(
            ".consultation-response-form"
        );

        if (!form) {
            return;
        }

        event.preventDefault();

        const consultationId =
            Number(form.dataset.consultationId);

        const textarea =
            form.querySelector(
                'textarea[name="risposta"]'
            );

        const fileInput =
            form.querySelector(
                'input[name="allegati"]'
            );

        const risposta =
            textarea.value.trim();

        const files =
            fileInput.files;

        if (
            risposta.length < 2 &&
            files.length === 0
        ) {
            consultationMessage.textContent =
                "Inserisci una risposta oppure allega almeno un file";

            consultationMessage.className =
                "form-message error-message";

            return;
        }

        if (files.length > 8) {
            consultationMessage.textContent =
                "Puoi allegare al massimo 8 file";

            consultationMessage.className =
                "form-message error-message";

            return;
        }

        const button =
            form.querySelector(
                'button[type="submit"]'
            );

        button.disabled = true;
        button.textContent =
            "Invio in corso...";

        const formData =
            new FormData();

        formData.append(
            "risposta",
            risposta
        );

        Array.from(files).forEach((file) => {
            formData.append(
                "allegati",
                file
            );
        });

        try {
            const response = await fetch(
                `/api/tickets/${currentTicketId}` +
                `/consultations/${consultationId}/response`,
                {
                    method: "PATCH",
                    body: formData
                }
            );

            const risultato =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    risultato.message ||
                    "Invio della risposta non riuscito"
                );
            }

            consultationMessage.textContent =
                risultato.message;

            consultationMessage.className =
                "form-message success-message";

            await loadConsultations(
                currentTicketId
            );
        } catch (error) {
            consultationMessage.textContent =
                error.message;

            consultationMessage.className =
                "form-message error-message";

            button.disabled = false;
            button.textContent =
                "Invia risposta";
        }
    }
);

consultationList.addEventListener(
    "click",
    async (event) => {
        const button = event.target.closest(
            "[data-action]"
        );

        if (!button) {
            return;
        }

        const consultationId =
            Number(button.dataset.consultationId);

        if (!consultationId) {
            return;
        }

        const action = button.dataset.action;

        if (
            action ===
            "edit-consultation-response"
        ) {
            const card =
                button.closest(
                    ".consultation-card"
                );

            const form =
                card.querySelector(
                    ".consultation-response-form"
                );

            const responseBox =
                card.querySelector(
                    ".consultation-response"
                );

            if (form) {
                form.hidden = false;

                form.querySelector(
                    "textarea"
                ).focus();
            }

            if (responseBox) {
                responseBox.hidden = true;
            }

            return;
        }

        if (
            action ===
            "cancel-consultation-response-edit"
        ) {
            const card =
                button.closest(
                    ".consultation-card"
                );

            const form =
                card.querySelector(
                    ".consultation-response-form"
                );

            const responseBox =
                card.querySelector(
                    ".consultation-response"
                );

            if (form) {
                form.hidden = true;
            }

            if (responseBox) {
                responseBox.hidden = false;
            }

            return;
        }

        if (
            action ===
            "delete-consultation-response"
        ) {
            const conferma =
                window.confirm(
                    "Vuoi eliminare la tua risposta e tutti i suoi allegati?"
                );

            if (!conferma) {
                return;
            }

            try {
                button.disabled = true;

                const response = await fetch(
                    `/api/tickets/${currentTicketId}` +
                    `/consultations/${consultationId}/response`,
                    {
                        method: "DELETE"
                    }
                );

                const risultato =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        risultato.message ||
                        "Eliminazione della risposta non riuscita"
                    );
                }

                consultationMessage.textContent =
                    risultato.message;

                consultationMessage.className =
                    "form-message success-message";

                await loadConsultations(
                    currentTicketId
                );
            } catch (error) {
                consultationMessage.textContent =
                    error.message;

                consultationMessage.className =
                    "form-message error-message";

                button.disabled = false;
            }

            return;
        }

        if (
            action ===
            "delete-consultation-attachment"
        ) {
            const attachmentId =
                Number(
                    button.dataset.attachmentId
                );

            const conferma =
                window.confirm(
                    "Vuoi eliminare questo allegato?"
                );

            if (!conferma) {
                return;
            }

            try {
                button.disabled = true;

                const response = await fetch(
                    `/api/tickets/consultation-attachments/` +
                    `${attachmentId}`,
                    {
                        method: "DELETE"
                    }
                );

                const risultato =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        risultato.message ||
                        "Eliminazione dell'allegato non riuscita"
                    );
                }

                consultationMessage.textContent =
                    risultato.message;

                consultationMessage.className =
                    "form-message success-message";

                await loadConsultations(
                    currentTicketId
                );
            } catch (error) {
                consultationMessage.textContent =
                    error.message;

                consultationMessage.className =
                    "form-message error-message";

                button.disabled = false;
            }

            return;
        }
        consultationMessage.textContent = "";
        consultationMessage.className =
            "form-message";

        if (action === "edit-consultation") {
            const richiestaAttuale =
                button.dataset.request || "";

            const nuovaRichiesta =
                window.prompt(
                    "Modifica la richiesta:",
                    richiestaAttuale
                );

            if (nuovaRichiesta === null) {
                return;
            }

            const richiesta =
                nuovaRichiesta.trim();

            if (richiesta.length < 5) {
                consultationMessage.textContent =
                    "La richiesta deve contenere almeno 5 caratteri";

                consultationMessage.className =
                    "form-message error-message";

                return;
            }

            try {
                button.disabled = true;

                const response = await fetch(
                    `/api/tickets/${currentTicketId}` +
                    `/consultations/${consultationId}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            richiesta
                        })
                    }
                );

                const risultato =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        risultato.message ||
                        "Modifica non riuscita"
                    );
                }

                consultationMessage.textContent =
                    risultato.message;

                consultationMessage.className =
                    "form-message success-message";

                await loadConsultations(
                    currentTicketId
                );
            } catch (error) {
                consultationMessage.textContent =
                    error.message;

                consultationMessage.className =
                    "form-message error-message";

                button.disabled = false;
            }

            return;
        }

        if (action === "delete-consultation") {
            const conferma = window.confirm(
                "Vuoi eliminare definitivamente questa richiesta di consultazione?"
            );

            if (!conferma) {
                return;
            }

            try {
                button.disabled = true;

                const response = await fetch(
                    `/api/tickets/${currentTicketId}` +
                    `/consultations/${consultationId}`,
                    {
                        method: "DELETE"
                    }
                );

                const risultato =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        risultato.message ||
                        "Eliminazione non riuscita"
                    );
                }

                consultationMessage.textContent =
                    risultato.message;

                consultationMessage.className =
                    "form-message success-message";

                await loadConsultations(
                    currentTicketId
                );
            } catch (error) {
                consultationMessage.textContent =
                    error.message;

                consultationMessage.className =
                    "form-message error-message";

                button.disabled = false;
            }
        }
    }
);

function formatFileSize(bytes) {
    if (!bytes) {
        return "-";
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function loadRics(ticketId) {
    try {
        const response = await fetch(
            `/api/ric/ticket/${ticketId}`
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        if (risultato.rics.length === 0) {
            ricList.innerHTML = `
                <div class="empty-documents">
                    <p>
                        Non sono ancora presenti RIC
                        per questo ticket.
                    </p>
                </div>
            `;

            return;
        }

        ricList.innerHTML = risultato.rics
            .map((ric) => {
                const operatore =
                    ric.operatore_nome
                        ? `${ric.operatore_nome} ${ric.operatore_cognome}`
                        : "Operatore non disponibile";

                return `
                    <article class="document-card">
                        <div class="document-card-header">
                            <div>
                                <span class="document-type">
                                    RIC ${escapeHtml(ric.numero_ric)}
                                </span>

                                <h3>
                                    ${escapeHtml(
                    causaliRic[ric.causale] ||
                    ric.causale
                )}
                                </h3>
                            </div>

                            <span class="internal-badge">
                                Interno
                            </span>
                        </div>

                        <dl class="document-information">
                            <div>
                                <dt>Destinatario</dt>
                                <dd>
                                    ${escapeHtml(ric.destinatario)}
                                </dd>
                            </div>

                            <div>
                                <dt>Riferimento</dt>
                                <dd>
                                    ${escapeHtml(ric.riferimento)}
                                </dd>
                            </div>

                            <div>
                                <dt>Data RIC</dt>
                                <dd>${formatDate(ric.data_ric)}</dd>
                            </div>

                            <div>
                                <dt>File</dt>
                                <dd>
                                    ${escapeHtml(
                    ric.nome_file_originale
                )}
                                    (${formatFileSize(
                    ric.dimensione_file
                )})
                                </dd>
                            </div>

                            <div>
                                <dt>Caricato da</dt>
                                <dd>${escapeHtml(operatore)}</dd>
                            </div>
                        </dl>

                        <div class="document-actions">
                            <a
                                class="button button-small"
                                href="/api/ric/${ric.id}/view"
                                target="_blank"
                                rel="noopener"
                            >
                                Visualizza
                            </a>

                            <a
                                class="button button-primary button-small"
                                href="/api/ric/${ric.id}/download"
                            >
                                Scarica
                            </a>
                        </div>
                    </article>
                `;
            })
            .join("");
    } catch (error) {
        ricList.innerHTML = "";

        ricMessage.textContent = error.message;
        ricMessage.className =
            "form-message error-message";
    }
}

showExistingBoatButton.addEventListener(
    "click",
    () => {
        existingBoatForm.hidden = false;
        newBoatForm.hidden = true;
    }
);

showNewBoatButton.addEventListener(
    "click",
    () => {
        existingBoatForm.hidden = true;
        newBoatForm.hidden = false;
    }
);

existingBoatForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const barcaId =
            Number(existingBoatSelect.value);

        if (
            !Number.isInteger(barcaId) ||
            barcaId <= 0
        ) {
            ticketBoatAssignmentMessage.textContent =
                "Seleziona una barca";

            ticketBoatAssignmentMessage.className =
                "form-message error-message";

            return;
        }

        ticketBoatAssignmentMessage.textContent =
            "Associazione della barca...";

        ticketBoatAssignmentMessage.className =
            "form-message";

        try {
            const response = await fetch(
                `/api/tickets/${currentTicketId}/boat`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        barca_id: barcaId
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

            window.location.reload();
        } catch (error) {
            ticketBoatAssignmentMessage.textContent =
                error.message;

            ticketBoatAssignmentMessage.className =
                "form-message error-message";
        }
    }
);

newBoatForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        ticketBoatAssignmentMessage.textContent =
            "Salvataggio della barca...";

        ticketBoatAssignmentMessage.className =
            "form-message";

        const datiBarca = {
            modello:
                document.getElementById(
                    "newBoatModel"
                ).value,

            matricola:
                document.getElementById(
                    "newBoatRegistration"
                ).value,

            anno_produzione:
                document.getElementById(
                    "newBoatYear"
                ).value,

            localizzazione:
                document.getElementById(
                    "newBoatLocation"
                ).value,

            indirizzo_consegna:
                document.getElementById(
                    "newBoatDeliveryAddress"
                ).value,

            garanzia_attivata_il:
                document.getElementById(
                    "newBoatWarrantyStart"
                ).value || null
        };

        try {
            const userResponse =
                await fetch("/api/auth/me");

            const userResult =
                await userResponse.json();

            const ticketResponse =
                await fetch(
                    `/api/tickets/${currentTicketId}`
                );

            const ticketResult =
                await ticketResponse.json();

            if (!ticketResponse.ok) {
                throw new Error(
                    ticketResult.message
                );
            }

            if (
                userResult.utente.ruolo ===
                "operatore"
            ) {
                datiBarca.cliente_id =
                    ticketResult.ticket.utente_id;
            }

            const boatResponse =
                await fetch(
                    "/api/boats",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(datiBarca)
                    }
                );

            const boatResult =
                await boatResponse.json();

            if (!boatResponse.ok) {
                throw new Error(
                    boatResult.message
                );
            }

            const associationResponse =
                await fetch(
                    `/api/tickets/` +
                    `${currentTicketId}/boat`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                barca_id:
                                    boatResult.barca.id
                            })
                    }
                );

            const associationResult =
                await associationResponse.json();

            if (!associationResponse.ok) {
                throw new Error(
                    associationResult.message
                );
            }

            window.location.reload();
        } catch (error) {
            ticketBoatAssignmentMessage.textContent =
                error.message;

            ticketBoatAssignmentMessage.className =
                "form-message error-message";
        }
    }
);


loadTicketDetail();