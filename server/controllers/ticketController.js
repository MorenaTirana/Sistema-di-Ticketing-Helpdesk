const db = require("../db");
const {
    createNotification
} = require("../services/notificationService");

const categorieConsentite = [
    "problema_tecnico",
    "accesso_account",
    "fatturazione",
    "informazioni",
    "altro"
];

async function createTicket(req, res) {
    let connection;

    try {
        const utenteCollegato = req.session.utente;

        const {
            cliente_id,
            barca_id,
            indirizzo_consegna,
            localizzazione_barca,
            tipo_richiesta,
            titolo,
            descrizione,
            categoria
        } = req.body;

        const allegati =
            Array.isArray(req.files)
                ? req.files
                : [];

        const contieneFotoOVideo =
            allegati.some((file) =>
                file.mimetype.startsWith("image/") ||
                file.mimetype.startsWith("video/")
            );

        if (!contieneFotoOVideo) {
            return res.status(400).json({
                message:
                    "Carica almeno una foto o un video del problema"
            });
        }

        const tipiRichiestaConsentiti = [
            "garanzia",
            "ricambi",
            "servizio"
        ];

        if (
            utenteCollegato.ruolo !== "utente" &&
            utenteCollegato.ruolo !== "operatore"
        ) {
            return res.status(403).json({
                message:
                    "Non sei autorizzato ad aprire un ticket"
            });
        }

        /*
         * Il cliente può creare ticket solamente per sé.
         * L'operatore deve invece indicare il cliente.
         */
        let clienteId;

        if (utenteCollegato.ruolo === "utente") {
            clienteId = utenteCollegato.id;
        } else {
            clienteId = Number(cliente_id);

            if (
                !Number.isInteger(clienteId) ||
                clienteId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Seleziona il cliente per il quale aprire il ticket"
                });
            }

            const [clienti] = await db.execute(
                `SELECT id
                 FROM utenti
                 WHERE id = ?
                   AND ruolo = 'utente'`,
                [clienteId]
            );

            if (clienti.length === 0) {
                return res.status(400).json({
                    message: "Cliente non valido"
                });
            }
        }

        const barcaId = Number(barca_id);

        if (
            !Number.isInteger(barcaId) ||
            barcaId <= 0
        ) {
            return res.status(400).json({
                message: "Seleziona una barca valida"
            });
        }

        if (
            !titolo ||
            !descrizione ||
            !categoria ||
            !tipo_richiesta ||
            !indirizzo_consegna ||
            !localizzazione_barca
        ) {
            return res.status(400).json({
                message:
                    "Tutti i dati del ticket sono obbligatori"
            });
        }

        if (
            !tipiRichiestaConsentiti.includes(
                tipo_richiesta
            )
        ) {
            return res.status(400).json({
                message: "Tipo di richiesta non valido"
            });
        }

        const titoloPulito = titolo.trim();
        const descrizionePulita = descrizione.trim();
        const indirizzoConsegnaPulito =
            indirizzo_consegna.trim();
        const localizzazioneBarcaPulita =
            localizzazione_barca.trim();

        if (titoloPulito.length < 5) {
            return res.status(400).json({
                message:
                    "Il titolo deve contenere almeno 5 caratteri"
            });
        }

        if (descrizionePulita.length < 10) {
            return res.status(400).json({
                message:
                    "La descrizione deve contenere almeno 10 caratteri"
            });
        }

        if (
            indirizzoConsegnaPulito.length < 5 ||
            indirizzoConsegnaPulito.length > 255
        ) {
            return res.status(400).json({
                message: "Indirizzo di consegna non valido"
            });
        }

        if (
            localizzazioneBarcaPulita.length < 2 ||
            localizzazioneBarcaPulita.length > 255
        ) {
            return res.status(400).json({
                message: "Localizzazione della barca non valida"
            });
        }

        if (!categorieConsentite.includes(categoria)) {
            return res.status(400).json({
                message: "Categoria non valida"
            });
        }

        /*
         * La barca deve appartenere al cliente:
         * non basta che il suo ID esista.
         */
        const [barche] = await db.execute(
            `SELECT id
             FROM barche
             WHERE id = ?
               AND utente_id = ?`,
            [barcaId, clienteId]
        );

        if (barche.length === 0) {
            return res.status(403).json({
                message:
                    "La barca selezionata non appartiene al cliente"
            });
        }

        const operatoreId =
            utenteCollegato.ruolo === "operatore"
                ? utenteCollegato.id
                : null;

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [risultato] = await connection.execute(
            `INSERT INTO ticket (
                utente_id,
                barca_id,
                indirizzo_consegna,
                localizzazione_barca,
                operatore_id,
                titolo,
                descrizione,
                categoria,
                tipo_richiesta
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                clienteId,
                barcaId,
                indirizzoConsegnaPulito,
                localizzazioneBarcaPulita,
                operatoreId,
                titoloPulito,
                descrizionePulita,
                categoria,
                tipo_richiesta
            ]
        );

        const ticketId = risultato.insertId;

        await connection.execute(
            `UPDATE barche
             SET localizzazione = ?
             WHERE id = ?
               AND utente_id = ?`,
            [
                localizzazioneBarcaPulita,
                barcaId,
                clienteId
            ]
        );

        for (const allegato of allegati) {
            let tipo = "documento";

            if (
                allegato.mimetype.startsWith("image/")
            ) {
                tipo = "foto";
            } else if (
                allegato.mimetype.startsWith("video/")
            ) {
                tipo = "video";
            }

            await connection.execute(
                `INSERT INTO ticket_allegati (
                    ticket_id,
                    ticket_voce_id,
                    tipo,
                    descrizione,
                    nome_file_originale,
                    nome_file_salvato,
                    mime_type,
                    dimensione_file,
                    durata_secondi,
                    nome_anteprima,
                    caricato_da,
                    visibile_cliente,
                    consenso_analisi_ai
                 )
                 VALUES (
                    ?, NULL, ?, ?, ?, ?, ?, ?,
                    NULL, NULL, ?, 1, 0
                 )`,
                [
                    ticketId,
                    tipo,
                    "Allegato iniziale della richiesta",
                    allegato.originalname,
                    allegato.filename,
                    allegato.mimetype,
                    allegato.size,
                    utenteCollegato.id
                ]
            );
        }
        /*
       * Se il ticket è creato da un operatore,
       * viene avvisato il cliente.
       *
       * Se è creato dal cliente,
       * vengono avvisati tutti gli operatori.
       */
        if (utenteCollegato.ruolo === "operatore") {
            await createNotification({
                utenteId: clienteId,
                ticketId,
                tipo: "nuova_pratica",
                messaggio:
                    `È stata registrata la pratica #${ticketId} ` +
                    `per la tua richiesta di assistenza.`,
                connection
            });
        } else {
            const [operatori] =
                await connection.execute(
                    `SELECT id
             FROM utenti
             WHERE ruolo = 'operatore'`
                );

            const nomeCliente = [
                utenteCollegato.nome,
                utenteCollegato.cognome
            ]
                .filter(Boolean)
                .join(" ");

            for (const operatore of operatori) {
                await createNotification({
                    utenteId: operatore.id,
                    ticketId,
                    tipo: "nuovo_ticket",
                    messaggio:
                        `${nomeCliente || "Un cliente"} ` +
                        `ha aperto il ticket #${ticketId}: ` +
                        `"${titoloPulito}".`,
                    connection
                });
            }
        }

        await connection.commit();

        return res.status(201).json({
            message: "Ticket creato correttamente",

            ticket: {
                id: ticketId,
                utente_id: clienteId,
                barca_id: barcaId,
                indirizzo_consegna:
                    indirizzoConsegnaPulito,
                localizzazione_barca:
                    localizzazioneBarcaPulita,
                operatore_id: operatoreId,
                titolo: titoloPulito,
                descrizione: descrizionePulita,
                categoria,
                tipo_richiesta,
                copertura: "da_valutare",
                priorita: "media",
                stato: "aperto"
            }
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Errore durante la creazione del ticket:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function getTickets(req, res) {
    try {
        const utente = req.session.utente;

        let query = `
            SELECT
                t.id,
                t.titolo,
                t.descrizione,
                t.categoria,
                t.stato,
                t.priorita,
                t.created_at,
                t.updated_at,
                t.tipo_richiesta,
                t.copertura,
                t.costo,
                t.indirizzo_consegna,
                t.localizzazione_barca,
                b.id AS barca_id,
                b.modello AS barca_modello,
                b.matricola AS barca_matricola,
                b.anno_produzione AS barca_anno_produzione,
                b.localizzazione AS barca_localizzazione,
                b.garanzia_attivata_il,
                b.garanzia_scadenza_il,
                u.id AS utente_id,
                u.nome AS utente_nome,
                u.cognome AS utente_cognome,
                u.email AS utente_email, 
                op.id AS operatore_id,
                op.nome AS operatore_nome,
                op.cognome AS operatore_cognome,
                op.email AS operatore_email,
                anteprima.id AS allegato_anteprima_id,
                anteprima.tipo AS allegato_anteprima_tipo,
                anteprima.mime_type AS allegato_anteprima_mime,
                anteprima.nome_file_originale
    AS allegato_anteprima_nome

            FROM ticket AS t

            INNER JOIN utenti AS u
                ON t.utente_id = u.id

            LEFT JOIN barche AS b
                ON t.barca_id = b.id 
            
            LEFT JOIN utenti AS op
                ON t.operatore_id = op.id

            LEFT JOIN ticket_allegati AS anteprima
                ON anteprima.id = (
                    SELECT MIN(ta.id)
                    FROM ticket_allegati AS ta
                    WHERE ta.ticket_id = t.id
                        AND ta.tipo IN ('foto', 'video')
    )
        `;

        const parametri = [];

        if (utente.ruolo === "utente") {
            query += `
        WHERE t.utente_id = ?
    `;

            parametri.push(utente.id);
        } else if (utente.ruolo === "tecnico") {
            query += `
        WHERE EXISTS (
            SELECT 1
            FROM consultazioni_ticket AS ct
            WHERE ct.ticket_id = t.id
              AND ct.consulente_id = ?
        )
    `;

            parametri.push(utente.id);
        }

        query += `
            ORDER BY
                CASE
                    WHEN t.stato IN ('aperto', 'in_lavorazione')
                        THEN 0
                    ELSE 1
                END,
                t.created_at ASC
        `;

        const [ticket] = await db.execute(query, parametri);

        return res.status(200).json({
            ticket
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero dei ticket:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function getTicketById(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const utente = req.session.utente;

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message: "Identificativo del ticket non valido"
            });
        }

        const [risultati] = await db.execute(
            `SELECT
                t.id,
                t.titolo,
                t.descrizione,
                t.categoria,
                t.stato,
                t.priorita,
                t.created_at,
                t.updated_at,
                t.tipo_richiesta,
                t.copertura,
                t.costo,
                t.shipping_fee,
                t.indirizzo_consegna,
                t.localizzazione_barca,
                b.id AS barca_id,
                b.modello AS barca_modello,
                b.matricola AS barca_matricola,
                b.anno_produzione AS barca_anno_produzione,
                COALESCE(
                    t.localizzazione_barca,
                    b.localizzazione
                ) AS barca_localizzazione,
                COALESCE(
                    t.indirizzo_consegna,
                    b.indirizzo_consegna
                ) AS barca_indirizzo_consegna,
                b.garanzia_attivata_il,
                b.garanzia_scadenza_il,
                u.id AS utente_id,
                u.nome AS utente_nome,
                u.cognome AS utente_cognome,
                u.email AS utente_email,
                u.telefono AS utente_telefono,
                u.indirizzo_residenza
                    AS utente_indirizzo_residenza,
                op.id AS operatore_id,
                op.nome AS operatore_nome,
                op.cognome AS operatore_cognome,
                op.email AS operatore_email
             FROM ticket AS t
             INNER JOIN utenti AS u
                ON t.utente_id = u.id
             LEFT JOIN barche AS b
                ON t.barca_id = b.id
            LEFT JOIN utenti AS op
                ON t.operatore_id = op.id
             WHERE t.id = ?`,
            [ticketId]
        );

        if (risultati.length === 0) {
            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const ticket = risultati[0];

        if (
            utente.ruolo === "utente" &&
            ticket.utente_id !== utente.id
        ) {
            return res.status(403).json({
                message: "Non puoi visualizzare questo ticket"
            });
        }

        if (utente.ruolo === "tecnico") {
            const [consultazioni] =
                await db.execute(
                    `SELECT id
             FROM consultazioni_ticket
             WHERE ticket_id = ?
               AND consulente_id = ?
             LIMIT 1`,
                    [
                        ticketId,
                        utente.id
                    ]
                );

            if (consultazioni.length === 0) {
                return res.status(403).json({
                    message:
                        "Puoi visualizzare solamente i ticket per i quali hai ricevuto una consultazione"
                });
            }
        }
        const [articoliCommerciali] =
            await db.execute(
                `SELECT
            id,
            codice_articolo,
            descrizione_articolo,
            costo_articolo,
            quantita,
            estimated_lead_time
         FROM articoli_commerciali_ticket
         WHERE ticket_id = ?
         ORDER BY id ASC`,
                [ticketId]
            );

        ticket.articoli_commerciali =
            articoliCommerciali;
        return res.status(200).json({
            ticket
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero del ticket:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function updateTicketStatus(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const { stato } = req.body;

        const statiConsentiti = [
            "aperto",
            "in_lavorazione",
            "risolto"
        ];

        // 1. Controllo dell'identificativo del ticket
        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message: "Identificativo del ticket non valido"
            });
        }

        // 2. Controllo dello stato ricevuto
        if (stato === "chiuso") {
            return res.status(400).json({
                message:
                    "Il ticket può essere chiuso solamente dal cliente dopo la conferma della risoluzione"
            });
        }

        if (!statiConsentiti.includes(stato)) {
            return res.status(400).json({
                message: "Stato non valido"
            });
        }

        // 3. Recupero del ticket e del suo proprietario
        const [risultati] = await db.execute(
            `SELECT id, stato, utente_id
             FROM ticket
             WHERE id = ?`,
            [ticketId]
        );

        if (risultati.length === 0) {
            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const ticket = risultati[0];

        // 4. Evitiamo un aggiornamento inutile
        if (ticket.stato === stato) {
            return res.status(400).json({
                message: "Il ticket si trova già in questo stato"
            });
        }

        // 5. Aggiornamento dello stato nel database
        await db.execute(
            `UPDATE ticket
             SET stato = ?
             WHERE id = ?`,
            [stato, ticketId]
        );
        // Registriamo il cambio nello storico.
        await db.execute(
            `INSERT INTO storico_stati (
                ticket_id,
                operatore_id,
                stato_precedente,
                stato_nuovo
            )
            VALUES (?, ?, ?, ?)`,
            [
                ticketId,
                req.session.utente.id,
                ticket.stato,
                stato
            ]
        );

        // 6. Traduzione dello stato per il messaggio
        const nomiStato = {
            aperto: "Aperto",
            in_lavorazione: "In lavorazione",
            risolto: "Risolto",
            chiuso: "Chiuso"
        };

        // 7. Creazione della notifica per il proprietario
        await createNotification({
            utenteId: ticket.utente_id,
            ticketId: ticketId,
            tipo: "stato_modificato",
            messaggio:
                `Lo stato del ticket #${ticketId} è stato modificato in "${nomiStato[stato]}".`
        });

        // 8. Risposta inviata al frontend
        return res.status(200).json({
            message: "Stato aggiornato correttamente",
            ticket: {
                id: ticketId,
                stato
            }
        });
    } catch (error) {
        console.error(
            "Errore durante l'aggiornamento dello stato:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function updateCustomerResolution(req, res) {
    try {
        const ticketId =
            Number(req.params.id);

        const utente =
            req.session.utente;

        const { esito } =
            req.body;

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        if (utente.ruolo !== "utente") {
            return res.status(403).json({
                message:
                    "La conferma è riservata al cliente"
            });
        }

        const esitiConsentiti = [
            "confermato",
            "persiste"
        ];

        if (!esitiConsentiti.includes(esito)) {
            return res.status(400).json({
                message:
                    "Esito della conferma non valido"
            });
        }

        const [risultati] =
            await db.execute(
                `SELECT
                    id,
                    titolo,
                    utente_id,
                    operatore_id,
                    stato
                 FROM ticket
                 WHERE id = ?`,
                [ticketId]
            );

        if (risultati.length === 0) {
            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const ticket =
            risultati[0];

        if (
            Number(ticket.utente_id) !==
            Number(utente.id)
        ) {
            return res.status(403).json({
                message:
                    "Non puoi confermare questo ticket"
            });
        }

        if (ticket.stato !== "risolto") {
            return res.status(400).json({
                message:
                    "Puoi confermare solamente un ticket risolto"
            });
        }

        const nuovoStato =
            esito === "confermato"
                ? "chiuso"
                : "in_lavorazione";

        await db.execute(
            `UPDATE ticket
             SET stato = ?
             WHERE id = ?`,
            [
                nuovoStato,
                ticketId
            ]
        );

        const testoFeedback =
            esito === "confermato"
                ? "Confermo che il problema è stato risolto."
                : "Il problema persiste e richiede ulteriore assistenza.";

        await db.execute(
            `INSERT INTO commenti (
        ticket_id,
        utente_id,
        testo
    )
    VALUES (?, ?, ?)`,
            [
                ticketId,
                utente.id,
                testoFeedback
            ]
        );
        if (esito === "confermato") {
            const autoreMessaggio =
                ticket.operatore_id ||
                utente.id;

            const messaggioChiusura =
                `La richiesta “${ticket.titolo}” è stata risolta ` +
                `e il ticket n. ${ticketId} viene pertanto chiuso. ` +
                `Restiamo a disposizione per ulteriori necessità. ` +
                `Grazie per la preziosa collaborazione.`;

            await db.execute(
                `INSERT INTO commenti (
            ticket_id,
            utente_id,
            testo
        )
        VALUES (?, ?, ?)`,
                [
                    ticketId,
                    autoreMessaggio,
                    messaggioChiusura
                ]
            );
        }
        await db.execute(
            `INSERT INTO storico_stati (
                ticket_id,
                operatore_id,
                stato_precedente,
                stato_nuovo
            )
            VALUES (?, NULL, ?, ?)`,
            [
                ticketId,
                ticket.stato,
                nuovoStato
            ]
        );

        if (ticket.operatore_id) {
            const messaggioNotifica =
                esito === "confermato"
                    ? `Il cliente ha confermato la risoluzione del ticket #${ticketId}.`
                    : `Il cliente ha indicato che il problema del ticket #${ticketId} persiste.`;

            await createNotification({
                utenteId:
                    ticket.operatore_id,
                ticketId,
                tipo:
                    "conferma_cliente",
                messaggio:
                    messaggioNotifica
            });
        }

        return res.status(200).json({
            message:
                esito === "confermato"
                    ? "Risoluzione confermata. Il ticket è stato chiuso."
                    : "Segnalazione ricevuta. Il ticket è tornato in lavorazione.",
            ticket: {
                id: ticketId,
                stato: nuovoStato
            }
        });
    } catch (error) {
        console.error(
            "Errore conferma risoluzione:",
            error
        );

        return res.status(500).json({
            message:
                "Errore interno del server"
        });
    }
}

async function updateTicketManagement(req, res) {
    let connection;

    try {
        const ticketId = Number(req.params.id);
        const utente = req.session.utente;

        const {
            copertura,
            costo,
            priorita,
            shipping_fee,
            articoli
        } = req.body;


        const aggiornaCommerciale =
            Array.isArray(articoli);
        const copertureConsentite = [
            "da_valutare",
            "in_garanzia",
            "fuori_garanzia"
        ];

        const prioritaConsentite = [
            "bassa",
            "media",
            "alta",
            "urgente"
        ];

        if (utente.ruolo !== "operatore") {
            return res.status(403).json({
                message:
                    "Operazione riservata agli operatori"
            });
        }

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        if (!copertureConsentite.includes(copertura)) {
            return res.status(400).json({
                message: "Copertura non valida"
            });
        }

        if (!prioritaConsentite.includes(priorita)) {
            return res.status(400).json({
                message: "Priorità non valida"
            });
        }

        const costoNormalizzato =
            costo === "" ||
                costo === null ||
                costo === undefined
                ? null
                : Number(costo);

        if (
            costoNormalizzato !== null &&
            (
                !Number.isFinite(costoNormalizzato) ||
                costoNormalizzato < 0
            )
        ) {
            return res.status(400).json({
                message: "Costo non valido"
            });
        }
        const shippingFeeNormalizzato =
            shipping_fee === undefined
                ? null
                : Number(shipping_fee);

        if (
            shippingFeeNormalizzato !== null &&
            (
                !Number.isFinite(
                    shippingFeeNormalizzato
                ) ||
                shippingFeeNormalizzato < 0
            )
        ) {
            return res.status(400).json({
                message:
                    "Costo di spedizione non valido"
            });
        }

        const articoliNormalizzati = [];

        if (aggiornaCommerciale) {
            if (articoli.length > 50) {
                return res.status(400).json({
                    message:
                        "Puoi inserire al massimo 50 articoli"
                });
            }

            for (const articolo of articoli) {
                const codiceArticolo =
                    typeof articolo.codice_articolo ===
                        "string"
                        ? articolo.codice_articolo.trim()
                        : "";

                const descrizioneArticolo =
                    typeof articolo.descrizione_articolo ===
                        "string"
                        ? articolo.descrizione_articolo.trim()
                        : "";

                const costoArticolo =
                    Number(articolo.costo_articolo);

                const quantita =
                    Number(articolo.quantita);

                const tempoConsegna =
                    typeof articolo.estimated_lead_time ===
                        "string"
                        ? articolo.estimated_lead_time.trim()
                        : "";

                if (
                    !codiceArticolo ||
                    codiceArticolo.length > 100
                ) {
                    return res.status(400).json({
                        message:
                            "Inserisci un codice articolo valido"
                    });
                }

                if (
                    !descrizioneArticolo ||
                    descrizioneArticolo.length > 500
                ) {
                    return res.status(400).json({
                        message:
                            "Inserisci una descrizione valida per ogni articolo"
                    });
                }

                if (
                    !Number.isFinite(costoArticolo) ||
                    costoArticolo < 0
                ) {
                    return res.status(400).json({
                        message:
                            "Il costo di un articolo non è valido"
                    });
                }

                if (
                    !Number.isInteger(quantita) ||
                    quantita < 1
                ) {
                    return res.status(400).json({
                        message:
                            "La quantità deve essere un numero intero maggiore di zero"
                    });
                }

                if (tempoConsegna.length > 150) {
                    return res.status(400).json({
                        message:
                            "Il tempo di consegna è troppo lungo"
                    });
                }

                articoliNormalizzati.push({
                    codice_articolo:
                        codiceArticolo,

                    descrizione_articolo:
                        descrizioneArticolo,

                    costo_articolo:
                        costoArticolo,

                    quantita,

                    estimated_lead_time:
                        tempoConsegna || null
                });
            }
        }

        const [ticketTrovati] = await db.execute(
            `SELECT id, utente_id
             FROM ticket
             WHERE id = ?`,
            [ticketId]
        );

        if (ticketTrovati.length === 0) {
            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const ticket = ticketTrovati[0];

        const totaleArticoli =
            articoliNormalizzati.reduce(
                (totale, articolo) =>
                    totale +
                    (
                        articolo.costo_articolo *
                        articolo.quantita
                    ),
                0
            );

        const costoDaSalvare =
            aggiornaCommerciale
                ? totaleArticoli +
                (shippingFeeNormalizzato || 0)
                : costoNormalizzato;

        connection = await db.getConnection();
        await connection.beginTransaction();

        await connection.execute(
            `UPDATE ticket
     SET
        copertura = ?,
        costo = ?,
        priorita = ?,
        shipping_fee =
            COALESCE(?, shipping_fee)
     WHERE id = ?`,
            [
                copertura,
                costoDaSalvare,
                priorita,
                shippingFeeNormalizzato,
                ticketId
            ]
        );

        if (aggiornaCommerciale) {
            await connection.execute(
                `DELETE
         FROM articoli_commerciali_ticket
         WHERE ticket_id = ?`,
                [ticketId]
            );

            for (
                const articolo of
                articoliNormalizzati
            ) {
                await connection.execute(
                    `INSERT INTO
                articoli_commerciali_ticket (
                    ticket_id,
                    codice_articolo,
                    descrizione_articolo,
                    costo_articolo,
                    quantita,
                    estimated_lead_time
                )
             VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        ticketId,
                        articolo.codice_articolo,
                        articolo.descrizione_articolo,
                        articolo.costo_articolo,
                        articolo.quantita,
                        articolo.estimated_lead_time
                    ]
                );
            }
        }

        const nomiCopertura = {
            da_valutare: "Da valutare",
            in_garanzia: "In garanzia",
            fuori_garanzia: "Fuori garanzia"
        };

        const nomiPriorita = {
            bassa: "Bassa",
            media: "Media",
            alta: "Alta",
            urgente: "Urgente"
        };

        const testoCosto =
            costoDaSalvare === null
                ? "non ancora definito"
                : `${costoDaSalvare.toFixed(2)} euro`;

        await createNotification({
            utenteId: ticket.utente_id,
            ticketId,
            tipo: "gestione_aggiornata",
            messaggio:
                `Il ticket #${ticketId} è stato aggiornato: ` +
                `priorità "${nomiPriorita[priorita]}", ` +
                `copertura "${nomiCopertura[copertura]}", ` +
                `costo ${testoCosto}.`,
            connection
        });

        await connection.commit();

        return res.status(200).json({
            message:
                "Gestione del ticket aggiornata correttamente",

            ticket: {
                id: ticketId,
                copertura,
                costo: costoDaSalvare,
                shipping_fee:
                    shippingFeeNormalizzato,
                articoli:
                    articoliNormalizzati,
                priorita
            }
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Errore durante l'aggiornamento della gestione:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function assignTicket(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const operatoreId = Number(req.body.operatore_id);
        const utenteCorrente =
            req.session.utente;

        const [gestori] = await db.execute(
            `SELECT id
     FROM utenti
     WHERE id = ?
       AND ruolo = 'operatore'
       AND puo_gestire_operatori = TRUE
       AND attivo = TRUE`,
            [utenteCorrente.id]
        );

        if (gestori.length === 0) {
            return res.status(403).json({
                message:
                    "Solamente il Main Operator può assegnare i ticket"
            });
        }

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        if (
            !Number.isInteger(operatoreId) ||
            operatoreId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Seleziona un operatore valido"
            });
        }

        // Recuperiamo il ticket e il suo proprietario.
        const [ticketTrovati] = await db.execute(
            `SELECT
                id,
                utente_id,
                operatore_id
             FROM ticket
             WHERE id = ?`,
            [ticketId]
        );

        if (ticketTrovati.length === 0) {
            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const ticket = ticketTrovati[0];

        // Controlliamo che l'utente scelto
        // sia realmente un operatore.
        const [operatori] = await db.execute(
            `SELECT
        id,
        nome,
        cognome,
        email,
        funzione,
        tipo_operatore
     FROM utenti
     WHERE id = ?
       AND ruolo = 'operatore'
       AND tipo_operatore = 'after_sales'
       AND attivo = TRUE`,
            [operatoreId]
        );

        if (operatori.length === 0) {
            return res.status(400).json({
                message:
                    "Il ticket può essere assegnato solamente a un operatore After Sales"
            });
        }

        if (
            Number(ticket.operatore_id) ===
            operatoreId
        ) {
            return res.status(400).json({
                message:
                    "Il ticket è già assegnato a questo operatore"
            });
        }

        const operatore = operatori[0];

        await db.execute(
            `UPDATE ticket
             SET operatore_id = ?
             WHERE id = ?`,
            [operatoreId, ticketId]
        );

        await createNotification({
            utenteId: ticket.utente_id,
            ticketId,
            tipo: "assegnazione",
            messaggio:
                `Il ticket #${ticketId} è stato assegnato ` +
                `all'operatore ${operatore.nome} ` +
                `${operatore.cognome}.`
        });

        return res.status(200).json({
            message:
                "Ticket assegnato correttamente",

            ticket: {
                id: ticketId,
                operatore: {
                    id: operatore.id,
                    nome: operatore.nome,
                    cognome: operatore.cognome,
                    email: operatore.email
                }
            }
        });
    } catch (error) {
        console.error(
            "Errore durante l'assegnazione del ticket:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function updateTicketBoat(req, res) {
    try {
        const ticketId =
            Number(req.params.id);

        const barcaId =
            Number(req.body.barca_id);

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        if (
            !Number.isInteger(barcaId) ||
            barcaId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Seleziona una barca valida"
            });
        }

        const [tickets] =
            await db.execute(
                `SELECT
                    id,
                    utente_id
                 FROM ticket
                 WHERE id = ?`,
                [ticketId]
            );

        if (tickets.length === 0) {
            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const ticket =
            tickets[0];

        const utente =
            req.session.utente;

        if (
            utente.ruolo === "utente" &&
            Number(ticket.utente_id) !==
            Number(utente.id)
        ) {
            return res.status(403).json({
                message:
                    "Non puoi modificare questo ticket"
            });
        }

        if (utente.ruolo === "tecnico") {
            const [consultazioni] = await db.execute(
                `SELECT id
                 FROM consultazioni_ticket
                 WHERE ticket_id = ?
                   AND consulente_id = ?
                 LIMIT 1`,
                [ticketId, utente.id]
            );

            if (consultazioni.length === 0) {
                return res.status(403).json({
                    message:
                        "Puoi modificare solamente i ticket per i quali hai ricevuto una consultazione"
                });
            }
        }

        const [barche] =
            await db.execute(
                `SELECT
                    id,
                    modello,
                    matricola
                 FROM barche
                 WHERE id = ?
                   AND utente_id = ?`,
                [
                    barcaId,
                    ticket.utente_id
                ]
            );

        if (barche.length === 0) {
            return res.status(403).json({
                message:
                    "La barca selezionata non appartiene al cliente del ticket"
            });
        }

        await db.execute(
            `UPDATE ticket
             SET barca_id = ?
             WHERE id = ?`,
            [
                barcaId,
                ticketId
            ]
        );

        return res.status(200).json({
            message:
                "Barca associata correttamente al ticket",

            barca: barche[0]
        });
    } catch (error) {
        console.error(
            "Errore associazione barca:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    updateTicketStatus,
    updateCustomerResolution,
    updateTicketManagement,
    assignTicket,
    updateTicketBoat
};