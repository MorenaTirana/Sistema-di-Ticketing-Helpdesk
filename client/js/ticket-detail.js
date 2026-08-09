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
const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const commentText = document.getElementById("commentText");
const commentsMessage = document.getElementById("commentsMessage");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const historyMessage = document.getElementById("historyMessage");
const documentsSection = document.getElementById("documentsSection");
const ticketDocumentsList = document.getElementById("ticketDocumentsList");
const documentsMessage = document.getElementById("documentsMessage");
const operatorRicArchive = document.getElementById("operatorRicArchive");
const documentUploadSection = document.getElementById("documentUploadSection");
const ticketOwnerEmail = document.getElementById("ticketOwnerEmail");

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
const managementMessage = document.getElementById("managementMessage");
const assignmentForm = document.getElementById("assignmentForm");
const operatorSelect = document.getElementById("operatorSelect");
const assignmentMessage = document.getElementById("assignmentMessage");
const uploadRicLink = document.getElementById("uploadRicLink");
const ricList = document.getElementById("ricList");
const ricMessage = document.getElementById("ricMessage");
const uploadDocumentLink = document.getElementById("uploadDocumentLink");

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

async function loadComments(ticketId) {
    try {
        const response = await fetch(
            `/api/tickets/${ticketId}/comments`
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        if (risultato.commenti.length === 0) {
            commentsList.innerHTML = `
                <div class="empty-comments">
                    <p>
                        Non sono ancora presenti commenti.
                        Scrivi il primo messaggio.
                    </p>
                </div>
            `;

            return;
        }

        commentsList.innerHTML = risultato.commenti
            .map((commento) => {
                return `
                    <article class="comment-card">
                        <div class="comment-header">
                            <strong>
                                ${escapeHtml(commento.utente_nome)}
                                ${escapeHtml(commento.utente_cognome)}
                            </strong>

                            <span class="comment-role">
                                ${escapeHtml(commento.utente_ruolo)}
                            </span>

                            <time>
                                ${formatDate(commento.created_at)}
                            </time>
                        </div>

                        <p>${escapeHtml(commento.testo)}</p>
                    </article>
                `;
            })
            .join("");
    } catch (error) {
        commentsMessage.textContent = error.message;
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
            throw new Error(risultato.message);
        }

        operatorSelect.innerHTML = "";

        const primaOpzione =
            document.createElement("option");

        primaOpzione.value = "";
        primaOpzione.textContent =
            "Seleziona un operatore";

        operatorSelect.appendChild(primaOpzione);

        risultato.operatori.forEach((operatore) => {
            const opzione =
                document.createElement("option");

            opzione.value = operatore.id;

            opzione.textContent =
                `${operatore.nome} ` +
                `${operatore.cognome} ` +
                `(${operatore.ticket_assegnati} ticket)`;

            operatorSelect.appendChild(opzione);
        });

        if (assignedOperatorId) {
            operatorSelect.value =
                String(assignedOperatorId);
        }
    } catch (error) {
        assignmentMessage.textContent =
            error.message;

        assignmentMessage.className =
            "form-message error-message";
    }
}

async function loadHistory(ticketId) {
    try {
        const response = await fetch(
            `/api/tickets/${ticketId}/history`
        );

        const risultato = await response.json();

        if (!response.ok) {
            throw new Error(risultato.message);
        }

        if (risultato.storico.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <p>
                        Non sono ancora presenti
                        modifiche di stato.
                    </p>
                </div>
            `;

            return;
        }

        historyList.innerHTML = risultato.storico
            .map((modifica) => {
                const operatore =
                    modifica.operatore_id
                        ? `${escapeHtml(
                            modifica.operatore_nome
                        )} ${escapeHtml(
                            modifica.operatore_cognome
                        )}`
                        : "Operatore non disponibile";

                return `
                    <article class="history-item">
                        <div class="history-marker"></div>

                        <div class="history-content">
                            <p>
                                <strong>
                                    ${
                                        stati[
                                            modifica.stato_precedente
                                        ]
                                    }
                                </strong>

                                <span>→</span>

                                <strong>
                                    ${
                                        stati[
                                            modifica.stato_nuovo
                                        ]
                                    }
                                </strong>
                            </p>

                            <small>
                                Modificato da
                                <strong>${operatore}</strong>
                                il
                                ${formatDate(
                                    modifica.created_at
                                )}
                            </small>
                        </div>
                    </article>
                `;
            })
            .join("");
    } catch (error) {
        historyList.innerHTML = "";

        historyMessage.textContent =
            error.message;

        historyMessage.className =
            "form-message error-message";
    }
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
            ticketDocumentsList.innerHTML = `
                <div class="empty-documents">
                    <p>
                        Non sono ancora presenti documenti
                        disponibili per questo ticket.
                    </p>
                </div>
            `;

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
                                        ${
                                            numeroCompleto
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
        uploadDocumentLink.href =
            `upload-document.html?ticket_id=${ticket.id}`;
        uploadRicLink.href = `upload-ric.html?ticket_id=${ticket.id}`;
        const userResponse = await fetch("/api/auth/me");
        const userResult = await userResponse.json();

        if (
            userResponse.ok &&
            userResult.utente.ruolo === "operatore"
        ) {
            operatorActions.hidden = false;
            operatorRicArchive.hidden = false;
            documentUploadSection.hidden = false;
            statusSelect.value = ticket.stato;
            prioritySelect.value = ticket.priorita ?? "media";
            coverageSelect.value = ticket.copertura ?? "da_valutare";
            ticketCostInput.value = ticket.costo ?? "";
            await loadOperators(ticket.operatore_id);
            await loadHistory(ticketId);
            await loadRics(ticket.id);
            await loadRics(ticket.id);
        }
        await loadDocuments(ticket.id, userResult.utente.ruolo);

        ticketNumber.textContent = `Ticket #${ticket.id}`;
        ticketStatus.textContent = stati[ticket.stato];
        ticketStatus.className = `ticket-status status-${ticket.stato}`;
        ticketTitle.textContent = ticket.titolo;
        ticketDescription.textContent = ticket.descrizione;
        ticketCategory.textContent = categorie[ticket.categoria];
        ticketStateText.textContent = stati[ticket.stato];
        ticketPriority.textContent = priorita[ticket.priorita] ?? "Media";
        ticketCreatedAt.textContent = formatDate(ticket.created_at);
        ticketOwner.textContent = `${ticket.utente_nome} ${ticket.utente_cognome}`;
        ticketOwnerEmail.textContent = ticket.utente_email || "Email non disponibile";
        ticketAssignedOperator.textContent =
            ticket.operatore_id
                ? `${ticket.operatore_nome} ${ticket.operatore_cognome}`
                : "Non assegnato";
        ticketRequestType.textContent = tipiRichiesta[ticket.tipo_richiesta] ?? "Non indicato";
        ticketCoverage.textContent = coperture[ticket.copertura] ?? "Da valutare";
        ticketCost.textContent = formatCost(ticket.costo);

        if (ticket.barca_id) {
            ticketBoatSection.hidden = false;

            boatModel.textContent =
                ticket.barca_modello;

            boatRegistration.textContent =
                ticket.barca_matricola;

            boatProductionYear.textContent =
                ticket.barca_anno_produzione;

            boatLocation.textContent =
                ticket.barca_localizzazione;

            boatDeliveryAddress.textContent =
                ticket.barca_indirizzo_consegna;

            boatWarrantyStart.textContent =
                formatDateOnly(
                    ticket.garanzia_attivata_il
                );

            boatWarrantyEnd.textContent =
                formatDateOnly(
                    ticket.garanzia_scadenza_il
                );

            if (!ticket.garanzia_scadenza_il) {
                boatWarrantyStatus.textContent =
                    "Garanzia non registrata";

                boatWarrantyStatus.className =
                    "warranty-badge warranty-unknown";
            } else {
                const scadenza =
                    new Date(ticket.garanzia_scadenza_il);

                if (scadenza >= new Date()) {
                    boatWarrantyStatus.textContent =
                        "Garanzia attiva";

                    boatWarrantyStatus.className =
                        "warranty-badge warranty-active";
                } else {
                    boatWarrantyStatus.textContent =
                        "Garanzia scaduta";

                    boatWarrantyStatus.className =
                        "warranty-badge warranty-expired";
                }
            }
        }

        await loadComments(ticketId);
    } catch (error) {
        ticketDetail.hidden = true;
        commentsSection.hidden = true;
        message.textContent = error.message;
        message.className = "form-message error-message";
    }
}

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

managementForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        managementMessage.textContent = "Salvataggio in corso...";
        managementMessage.className = "form-message";

        const costoInserito = ticketCostInput.value.trim();

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
                                : Number(costoInserito)
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

loadTicketDetail();
