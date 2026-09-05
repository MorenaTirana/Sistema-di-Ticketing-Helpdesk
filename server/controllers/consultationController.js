const db = require("../db");
const fs = require("fs");
const path = require("path");

const {
    createNotification
} = require("../services/notificationService");

async function isMainOperator(utenteId) {
    const [risultati] = await db.execute(
        `SELECT id
         FROM utenti
         WHERE id = ?
           AND ruolo = 'operatore'
           AND puo_gestire_operatori = TRUE
           AND attivo = TRUE`,
        [utenteId]
    );

    return risultati.length > 0;
}

async function createConsultation(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const consulenteId =
            Number(req.body.consulente_id);

        const richiesta =
            typeof req.body.richiesta === "string"
                ? req.body.richiesta.trim()
                : "";

        const utente = req.session.utente;

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        const mainOperator =
            await isMainOperator(utente.id);

        if (!mainOperator) {
            return res.status(403).json({
                message:
                    "Solamente il Main Operator può richiedere una consultazione"
            });
        }

        if (
            !Number.isInteger(consulenteId) ||
            consulenteId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Seleziona un consulente valido"
            });
        }

        if (richiesta.length < 5) {
            return res.status(400).json({
                message:
                    "La richiesta deve contenere almeno 5 caratteri"
            });
        }

        if (richiesta.length > 3000) {
            return res.status(400).json({
                message:
                    "La richiesta non può superare 3000 caratteri"
            });
        }

        const [ticket] = await db.execute(
            `SELECT id, titolo
             FROM ticket
             WHERE id = ?`,
            [ticketId]
        );

        if (ticket.length === 0) {
            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const [consulenti] = await db.execute(
            `SELECT
        id,
        nome,
        cognome,
        funzione
     FROM utenti
     WHERE id = ?
       AND ruolo = 'tecnico'
       AND tipo_operatore = 'consulente'
       AND attivo = TRUE`,
            [consulenteId]
        );
        if (consulenti.length === 0) {
            return res.status(400).json({
                message:
                    "L'utente selezionato non è un consulente interno attivo"
            });
        }

        const [risultato] = await db.execute(
            `INSERT INTO consultazioni_ticket (
                ticket_id,
                richiesta_da,
                consulente_id,
                richiesta,
                stato
             )
             VALUES (?, ?, ?, ?, 'richiesta')`,
            [
                ticketId,
                utente.id,
                consulenteId,
                richiesta
            ]
        );

        await createNotification({
            utenteId: consulenteId,
            ticketId,
            tipo: "consultazione_interna",
            messaggio:
                `${utente.nome} ${utente.cognome} ` +
                `ti ha richiesto una consultazione ` +
                `per il ticket #${ticketId}.`
        });

        return res.status(201).json({
            message:
                "Consultazione richiesta correttamente",

            consultazione: {
                id: risultato.insertId,
                ticket_id: ticketId,
                consulente_id: consulenteId,
                consulente_nome:
                    consulenti[0].nome,
                consulente_cognome:
                    consulenti[0].cognome,
                consulente_funzione:
                    consulenti[0].funzione,
                richiesta,
                risposta: null,
                stato: "richiesta"
            }
        });
    } catch (error) {
        console.error(
            "Errore creazione consultazione:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function getConsultations(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const utente = req.session.utente;

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        const mainOperator =
            await isMainOperator(utente.id);

        const parametri = [ticketId];

        let filtro = "";

        if (!mainOperator) {
            filtro =
                " AND ct.consulente_id = ?";

            parametri.push(utente.id);
        }

        const [consultazioni] = await db.execute(
            `SELECT
                ct.id,
                ct.ticket_id,
                ct.richiesta,
                ct.risposta,
                ct.stato,
                ct.created_at,
                ct.updated_at,

                richiedente.nome
                    AS richiedente_nome,
                richiedente.cognome
                    AS richiedente_cognome,

                consulente.id
                    AS consulente_id,
                consulente.nome
                    AS consulente_nome,
                consulente.cognome
                    AS consulente_cognome,
                consulente.funzione
                    AS consulente_funzione

             FROM consultazioni_ticket AS ct

             INNER JOIN utenti AS richiedente
                ON richiedente.id =
                   ct.richiesta_da

             INNER JOIN utenti AS consulente
                ON consulente.id =
                   ct.consulente_id

             WHERE ct.ticket_id = ?
             ${filtro}

             ORDER BY ct.created_at DESC`,
            parametri
        );

        const consultationIds =
            consultazioni.map(
                (consultazione) =>
                    Number(consultazione.id)
            );

        /*
         * Prepara sempre un array di risposte,
         * anche quando la consultazione è vuota.
         */
        consultazioni.forEach((consultazione) => {
            consultazione.risposte = [];
        });

        if (consultationIds.length > 0) {
            const placeholders =
                consultationIds
                    .map(() => "?")
                    .join(", ");

            /*
             * Recupera tutte le risposte delle
             * consultazioni visualizzate.
             */
            const [risposte] = await db.execute(
                `SELECT
            rc.id,
            rc.consultazione_id,
            rc.autore_id,
            rc.testo,
            rc.created_at,
            rc.updated_at,

            autore.nome AS autore_nome,
            autore.cognome AS autore_cognome,
            autore.funzione AS autore_funzione

         FROM risposte_consultazioni AS rc

         INNER JOIN utenti AS autore
            ON autore.id = rc.autore_id

         WHERE rc.consultazione_id
            IN (${placeholders})

         ORDER BY rc.created_at ASC`,
                consultationIds
            );

            const responseIds =
                risposte.map(
                    (risposta) =>
                        Number(risposta.id)
                );

            /*
             * Ogni risposta possiede il proprio
             * array di allegati.
             */
            risposte.forEach((risposta) => {
                risposta.allegati = [];
            });

            if (responseIds.length > 0) {
                const responsePlaceholders =
                    responseIds
                        .map(() => "?")
                        .join(", ");

                const [allegati] =
                    await db.execute(
                        `SELECT
                    id,
                    consultazione_id,
                    risposta_id,
                    caricato_da,
                    nome_originale,
                    nome_file,
                    mime_type,
                    dimensione,
                    created_at

                 FROM allegati_consultazioni

                 WHERE risposta_id
                    IN (${responsePlaceholders})

                 ORDER BY created_at ASC`,
                        responseIds
                    );

                const allegatiPerRisposta =
                    new Map();

                allegati.forEach((allegato) => {
                    const rispostaId =
                        Number(allegato.risposta_id);

                    if (
                        !allegatiPerRisposta.has(
                            rispostaId
                        )
                    ) {
                        allegatiPerRisposta.set(
                            rispostaId,
                            []
                        );
                    }

                    allegatiPerRisposta
                        .get(rispostaId)
                        .push(allegato);
                });

                risposte.forEach((risposta) => {
                    risposta.allegati =
                        allegatiPerRisposta.get(
                            Number(risposta.id)
                        ) || [];
                });
            }

            /*
             * Raggruppa le risposte sotto
             * la rispettiva consultazione.
             */
            const rispostePerConsultazione =
                new Map();

            risposte.forEach((risposta) => {
                const consultationId =
                    Number(
                        risposta.consultazione_id
                    );

                if (
                    !rispostePerConsultazione.has(
                        consultationId
                    )
                ) {
                    rispostePerConsultazione.set(
                        consultationId,
                        []
                    );
                }

                rispostePerConsultazione
                    .get(consultationId)
                    .push(risposta);
            });

            consultazioni.forEach((consultazione) => {
                consultazione.risposte =
                    rispostePerConsultazione.get(
                        Number(consultazione.id)
                    ) || [];
            });
        }

        return res.status(200).json({
            consultazioni,
            main_operator: mainOperator,
            utente_id: utente.id
        });
    } catch (error) {
        console.error(
            "Errore recupero consultazioni:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function getMyConsultations(req, res) {
    try {
        const utente = req.session.utente;

        const [consultazioni] = await db.execute(
            `SELECT
                ct.id,
                ct.ticket_id,
                ct.richiesta,
                ct.risposta,
                ct.stato,
                ct.created_at,
                ct.updated_at,

                t.titolo AS ticket_titolo,
                t.stato AS ticket_stato,

                richiedente.nome AS richiedente_nome,
                richiedente.cognome AS richiedente_cognome

             FROM consultazioni_ticket AS ct

             INNER JOIN ticket AS t
                ON t.id = ct.ticket_id

             INNER JOIN utenti AS richiedente
                ON richiedente.id = ct.richiesta_da

             WHERE ct.consulente_id = ?

             ORDER BY
                CASE
                    WHEN ct.stato = 'richiesta' THEN 0
                    ELSE 1
                END,
                ct.created_at DESC`,
            [utente.id]
        );

        return res.status(200).json({
            consultazioni
        });
    } catch (error) {
        console.error(
            "Errore recupero consultazioni assegnate:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function respondConsultation(req, res) {
    let connection;

    try {
        const consultationId =
            Number(req.params.consultationId);

        const ticketId =
            Number(req.params.id);

        const utente = req.session.utente;

        const risposta =
            typeof req.body.risposta === "string"
                ? req.body.risposta.trim()
                : "";

        const allegati =
            Array.isArray(req.files)
                ? req.files
                : [];

        if (
            !Number.isInteger(consultationId) ||
            consultationId <= 0 ||
            !Number.isInteger(ticketId) ||
            ticketId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo della consultazione non valido"
            });
        }

        /*
         * Il tecnico deve inserire una risposta
         * oppure almeno un allegato.
         */
        if (
            risposta.length < 2 &&
            allegati.length === 0
        ) {
            return res.status(400).json({
                message:
                    "Inserisci una risposta oppure allega almeno un file"
            });
        }

        if (risposta.length > 3000) {
            return res.status(400).json({
                message:
                    "La risposta non può superare 3000 caratteri"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        const [consultazioni] =
            await connection.execute(
                `SELECT
                    id,
                    ticket_id,
                    richiesta_da,
                    consulente_id,
                    stato
                 FROM consultazioni_ticket
                 WHERE id = ?
                   AND ticket_id = ?
                 FOR UPDATE`,
                [
                    consultationId,
                    ticketId
                ]
            );

        if (consultazioni.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message:
                    "Consultazione non trovata"
            });
        }

        const consultazione =
            consultazioni[0];

        if (
            Number(consultazione.consulente_id) !==
            Number(utente.id)
        ) {
            await connection.rollback();

            return res.status(403).json({
                message:
                    "Solamente il tecnico selezionato può rispondere"
            });
        }

        if (
            ![
                "richiesta",
                "risposta_ricevuta"
            ].includes(consultazione.stato)
        ) {
            await connection.rollback();

            return res.status(409).json({
                message:
                    "Non è possibile modificare questa risposta"
            });
        }

        await connection.execute(
            `UPDATE consultazioni_ticket
             SET
                risposta = ?,
                stato = 'risposta_ricevuta',
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                risposta || null,
                consultationId
            ]
        );

        for (const file of allegati) {
            await connection.execute(
                `INSERT INTO allegati_consultazioni (
                    consultazione_id,
                    caricato_da,
                    nome_originale,
                    nome_file,
                    mime_type,
                    dimensione
                 )
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    consultationId,
                    utente.id,
                    file.originalname,
                    file.filename,
                    file.mimetype,
                    file.size
                ]
            );
        }

        await connection.commit();

        /*
         * Un eventuale errore della notifica
         * non annulla la risposta già salvata.
         */
        try {
            await createNotification({
                utenteId:
                    consultazione.richiesta_da,

                ticketId:
                    consultazione.ticket_id,

                tipo:
                    "risposta_consultazione",

                messaggio:
                    `${utente.nome} ${utente.cognome} ` +
                    `ha risposto alla consultazione ` +
                    `del ticket #${consultazione.ticket_id}.`
            });
        } catch (notificationError) {
            console.error(
                "Errore notifica risposta consultazione:",
                notificationError
            );
        }

        return res.status(200).json({
            message:
                "Risposta inviata correttamente",

            risposta: risposta || null,

            allegati: allegati.map((file) => ({
                nome_originale:
                    file.originalname,
                mime_type:
                    file.mimetype,
                dimensione:
                    file.size
            }))
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Errore rollback consultazione:",
                    rollbackError
                );
            }
        }

        console.error(
            "Errore risposta consultazione:",
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

async function createAdditionalConsultationResponse(
    req,
    res
) {
    let connection;

    try {
        const ticketId =
            Number(req.params.id);

        const consultationId =
            Number(req.params.consultationId);

        const utente =
            req.session.utente;

        const testo =
            typeof req.body.testo === "string"
                ? req.body.testo.trim()
                : "";

        const allegati =
            Array.isArray(req.files)
                ? req.files
                : [];

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0 ||
            !Number.isInteger(consultationId) ||
            consultationId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo della consultazione non valido"
            });
        }

        if (
            testo.length < 2 &&
            allegati.length === 0
        ) {
            return res.status(400).json({
                message:
                    "Inserisci una risposta oppure allega almeno un file"
            });
        }

        if (testo.length > 3000) {
            return res.status(400).json({
                message:
                    "La risposta non può superare 3000 caratteri"
            });
        }

        connection =
            await db.getConnection();

        await connection.beginTransaction();

        const [consultazioni] =
            await connection.execute(
                `SELECT
                    id,
                    ticket_id,
                    richiesta_da,
                    consulente_id
                 FROM consultazioni_ticket
                 WHERE id = ?
                   AND ticket_id = ?
                 FOR UPDATE`,
                [
                    consultationId,
                    ticketId
                ]
            );

        if (consultazioni.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message:
                    "Consultazione non trovata"
            });
        }

        const consultazione =
            consultazioni[0];

        if (
            Number(consultazione.consulente_id) !==
            Number(utente.id)
        ) {
            await connection.rollback();

            return res.status(403).json({
                message:
                    "Puoi rispondere solamente alle consultazioni assegnate a te"
            });
        }

        /*
         * Crea una nuova risposta.
         * Non sovrascrive quelle precedenti.
         */
        const [risultatoRisposta] =
            await connection.execute(
                `INSERT INTO risposte_consultazioni (
                    consultazione_id,
                    autore_id,
                    testo
                 )
                 VALUES (?, ?, ?)`,
                [
                    consultationId,
                    utente.id,
                    testo || null
                ]
            );

        const rispostaId =
            risultatoRisposta.insertId;

        /*
         * Collega ogni file alla nuova risposta.
         */
        for (const file of allegati) {
            await connection.execute(
                `INSERT INTO allegati_consultazioni (
                    consultazione_id,
                    risposta_id,
                    caricato_da,
                    nome_originale,
                    nome_file,
                    mime_type,
                    dimensione
                 )
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    consultationId,
                    rispostaId,
                    utente.id,
                    file.originalname,
                    file.filename,
                    file.mimetype,
                    file.size
                ]
            );
        }

        /*
         * Mantiene aggiornato lo stato generale
         * della consultazione.
         */
        await connection.execute(
            `UPDATE consultazioni_ticket
             SET
                risposta = ?,
                stato = 'risposta_ricevuta',
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                testo || null,
                consultationId
            ]
        );

        await connection.commit();

        try {
            await createNotification({
                utenteId:
                    consultazione.richiesta_da,

                ticketId:
                    consultazione.ticket_id,

                tipo:
                    "risposta_consultazione",

                messaggio:
                    `${utente.nome} ${utente.cognome} ` +
                    `ha aggiunto una risposta alla consultazione ` +
                    `del ticket #${consultazione.ticket_id}.`
            });
        } catch (notificationError) {
            console.error(
                "Errore notifica nuova risposta:",
                notificationError
            );
        }

        return res.status(201).json({
            message:
                "Nuova risposta aggiunta correttamente",

            risposta: {
                id: rispostaId,
                consultazione_id:
                    consultationId,
                autore_id:
                    utente.id,
                testo:
                    testo || null,
                allegati:
                    allegati.map((file) => ({
                        nome_originale:
                            file.originalname,
                        mime_type:
                            file.mimetype,
                        dimensione:
                            file.size
                    }))
            }
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Errore rollback nuova risposta:",
                    rollbackError
                );
            }
        }

        console.error(
            "Errore creazione nuova risposta:",
            error
        );

        return res.status(500).json({
            message:
                "Errore interno del server"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function updateAdditionalConsultationResponse(
    req,
    res
) {
    try {
        const ticketId =
            Number(req.params.id);

        const consultationId =
            Number(req.params.consultationId);

        const responseId =
            Number(req.params.responseId);

        const utente =
            req.session.utente;

        const testo =
            typeof req.body.testo === "string"
                ? req.body.testo.trim()
                : "";

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0 ||
            !Number.isInteger(consultationId) ||
            consultationId <= 0 ||
            !Number.isInteger(responseId) ||
            responseId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo della risposta non valido"
            });
        }

        if (testo.length < 2) {
            return res.status(400).json({
                message:
                    "La risposta deve contenere almeno 2 caratteri"
            });
        }

        if (testo.length > 3000) {
            return res.status(400).json({
                message:
                    "La risposta non può superare 3000 caratteri"
            });
        }

        const [risultato] = await db.execute(
            `UPDATE risposte_consultazioni AS rc

             INNER JOIN consultazioni_ticket AS ct
                ON ct.id = rc.consultazione_id

             SET
                rc.testo = ?,
                rc.updated_at = CURRENT_TIMESTAMP

             WHERE rc.id = ?
               AND rc.consultazione_id = ?
               AND ct.ticket_id = ?
               AND rc.autore_id = ?
               AND ct.consulente_id = ?`,
            [
                testo,
                responseId,
                consultationId,
                ticketId,
                utente.id,
                utente.id
            ]
        );

        if (risultato.affectedRows === 0) {
            return res.status(403).json({
                message:
                    "Puoi modificare soltanto una tua risposta"
            });
        }

        /*
         * Mantiene sincronizzato il vecchio campo
         * della consultazione.
         */
        await db.execute(
            `UPDATE consultazioni_ticket
             SET
                risposta = ?,
                stato = 'risposta_ricevuta',
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?
               AND ticket_id = ?`,
            [
                testo,
                consultationId,
                ticketId
            ]
        );

        return res.status(200).json({
            message:
                "Risposta modificata correttamente"
        });
    } catch (error) {
        console.error(
            "Errore modifica risposta:",
            error
        );

        return res.status(500).json({
            message:
                "Errore interno del server"
        });
    }
}
async function deleteAdditionalConsultationResponse(
    req,
    res
) {
    let connection;

    try {
        const ticketId =
            Number(req.params.id);

        const consultationId =
            Number(req.params.consultationId);

        const responseId =
            Number(req.params.responseId);

        const utente =
            req.session.utente;

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0 ||
            !Number.isInteger(consultationId) ||
            consultationId <= 0 ||
            !Number.isInteger(responseId) ||
            responseId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo della risposta non valido"
            });
        }

        connection =
            await db.getConnection();

        await connection.beginTransaction();

        const [risposte] =
            await connection.execute(
                `SELECT
                    rc.id,
                    rc.autore_id,
                    ct.consulente_id

                 FROM risposte_consultazioni AS rc

                 INNER JOIN consultazioni_ticket AS ct
                    ON ct.id = rc.consultazione_id

                 WHERE rc.id = ?
                   AND rc.consultazione_id = ?
                   AND ct.ticket_id = ?

                 FOR UPDATE`,
                [
                    responseId,
                    consultationId,
                    ticketId
                ]
            );

        if (risposte.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message:
                    "Risposta non trovata"
            });
        }

        const risposta =
            risposte[0];

        if (
            Number(risposta.autore_id) !==
                Number(utente.id) ||
            Number(risposta.consulente_id) !==
                Number(utente.id)
        ) {
            await connection.rollback();

            return res.status(403).json({
                message:
                    "Puoi eliminare soltanto una tua risposta"
            });
        }

        const [allegati] =
            await connection.execute(
                `SELECT nome_file
                 FROM allegati_consultazioni
                 WHERE risposta_id = ?`,
                [responseId]
            );

        /*
         * Gli allegati vengono eliminati automaticamente
         * dal database grazie a ON DELETE CASCADE.
         */
        await connection.execute(
            `DELETE FROM risposte_consultazioni
             WHERE id = ?
               AND autore_id = ?`,
            [
                responseId,
                utente.id
            ]
        );

        /*
         * Recupera l'ultima eventuale risposta rimasta.
         */
        const [risposteRimaste] =
            await connection.execute(
                `SELECT testo
                 FROM risposte_consultazioni
                 WHERE consultazione_id = ?
                 ORDER BY created_at DESC, id DESC
                 LIMIT 1`,
                [consultationId]
            );

        if (risposteRimaste.length > 0) {
            await connection.execute(
                `UPDATE consultazioni_ticket
                 SET
                    risposta = ?,
                    stato = 'risposta_ricevuta',
                    updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [
                    risposteRimaste[0].testo,
                    consultationId
                ]
            );
        } else {
            await connection.execute(
                `UPDATE consultazioni_ticket
                 SET
                    risposta = NULL,
                    stato = 'richiesta',
                    updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [consultationId]
            );
        }

        await connection.commit();

        /*
         * Rimuove dal disco i file della risposta eliminata.
         */
        allegati.forEach((allegato) => {
            const filePath = path.join(
                __dirname,
                "../uploads/ticket-allegati",
                allegato.nome_file
            );

            fs.unlink(filePath, (error) => {
                if (
                    error &&
                    error.code !== "ENOENT"
                ) {
                    console.error(
                        "Errore eliminazione allegato:",
                        error
                    );
                }
            });
        });

        return res.status(200).json({
            message:
                "Risposta eliminata correttamente"
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Errore rollback:",
                    rollbackError
                );
            }
        }

        console.error(
            "Errore eliminazione risposta:",
            error
        );

        return res.status(500).json({
            message:
                "Errore interno del server"
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
async function updateConsultation(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const consultationId =
            Number(req.params.consultationId);

        const richiesta =
            typeof req.body.richiesta === "string"
                ? req.body.richiesta.trim()
                : "";

        const utente = req.session.utente;

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0 ||
            !Number.isInteger(consultationId) ||
            consultationId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo della consultazione non valido"
            });
        }

        if (richiesta.length < 5) {
            return res.status(400).json({
                message:
                    "La richiesta deve contenere almeno 5 caratteri"
            });
        }

        if (richiesta.length > 3000) {
            return res.status(400).json({
                message:
                    "La richiesta non può superare 3000 caratteri"
            });
        }

        const mainOperator =
            await isMainOperator(utente.id);

        if (!mainOperator) {
            return res.status(403).json({
                message:
                    "Solamente il Main Operator può modificare la consultazione"
            });
        }

        const [risultato] = await db.execute(
            `UPDATE consultazioni_ticket
             SET
                richiesta = ?,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?
               AND ticket_id = ?
               AND richiesta_da = ?
               AND stato = 'richiesta'`,
            [
                richiesta,
                consultationId,
                ticketId,
                utente.id
            ]
        );

        if (risultato.affectedRows === 0) {
            return res.status(403).json({
                message:
                    "La consultazione non può essere modificata: potrebbe avere già ricevuto una risposta"
            });
        }

        return res.status(200).json({
            message:
                "Consultazione modificata correttamente"
        });
    } catch (error) {
        console.error(
            "Errore modifica consultazione:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function deleteConsultation(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const consultationId =
            Number(req.params.consultationId);

        const utente = req.session.utente;

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0 ||
            !Number.isInteger(consultationId) ||
            consultationId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo della consultazione non valido"
            });
        }

        const mainOperator =
            await isMainOperator(utente.id);

        if (!mainOperator) {
            return res.status(403).json({
                message:
                    "Solamente il Main Operator può eliminare la consultazione"
            });
        }

        const [risultato] = await db.execute(
            `DELETE FROM consultazioni_ticket
             WHERE id = ?
               AND ticket_id = ?
               AND richiesta_da = ?
               AND stato = 'richiesta'`,
            [
                consultationId,
                ticketId,
                utente.id
            ]
        );

        if (risultato.affectedRows === 0) {
            return res.status(403).json({
                message:
                    "La consultazione non può essere eliminata: potrebbe avere già ricevuto una risposta"
            });
        }

        return res.status(200).json({
            message:
                "Consultazione eliminata correttamente"
        });
    } catch (error) {
        console.error(
            "Errore eliminazione consultazione:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function viewConsultationAttachment(req, res) {
    try {
        const attachmentId =
            Number(req.params.attachmentId);

        const utente = req.session.utente;

        if (
            !Number.isInteger(attachmentId) ||
            attachmentId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo dell'allegato non valido"
            });
        }

        const [risultati] = await db.execute(
            `SELECT
                ac.id,
                ac.nome_originale,
                ac.nome_file,
                ac.mime_type,
                ct.consulente_id,
                ct.richiesta_da
             FROM allegati_consultazioni AS ac
             INNER JOIN consultazioni_ticket AS ct
                ON ct.id = ac.consultazione_id
             WHERE ac.id = ?`,
            [attachmentId]
        );

        if (risultati.length === 0) {
            return res.status(404).json({
                message: "Allegato non trovato"
            });
        }

        const allegato = risultati[0];

        const mainOperator =
            await isMainOperator(utente.id);

        const autorizzato =
            mainOperator ||
            Number(allegato.consulente_id) ===
            Number(utente.id) ||
            Number(allegato.richiesta_da) ===
            Number(utente.id);

        if (!autorizzato) {
            return res.status(403).json({
                message:
                    "Non sei autorizzato a visualizzare questo allegato"
            });
        }

        const filePath = path.join(
            __dirname,
            "../uploads/ticket-allegati",
            allegato.nome_file
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message:
                    "Il file non è presente sul server"
            });
        }

        res.setHeader(
            "Content-Type",
            allegato.mime_type ||
            "application/octet-stream"
        );

        res.setHeader(
            "Content-Disposition",
            `inline; filename*=UTF-8''${encodeURIComponent(
                allegato.nome_originale
            )}`
        );

        return res.sendFile(filePath);
    } catch (error) {
        console.error(
            "Errore apertura allegato consultazione:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function deleteConsultationAttachment(req, res) {
    try {
        const attachmentId =
            Number(req.params.attachmentId);

        const utente =
            req.session.utente;

        if (
            !Number.isInteger(attachmentId) ||
            attachmentId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo dell'allegato non valido"
            });
        }

        /*
         * Recupera l'allegato e verifica che
         * appartenga alla risposta del tecnico collegato.
         */
        const [allegati] = await db.execute(
            `SELECT
                ac.id,
                ac.caricato_da,
                ac.nome_file,
                ct.consulente_id
             FROM allegati_consultazioni AS ac

             INNER JOIN consultazioni_ticket AS ct
                ON ct.id = ac.consultazione_id

             WHERE ac.id = ?`,
            [attachmentId]
        );

        if (allegati.length === 0) {
            return res.status(404).json({
                message:
                    "Allegato non trovato"
            });
        }

        const allegato =
            allegati[0];

        /*
         * Solamente il tecnico assegnato,
         * che ha caricato il file, può eliminarlo.
         */
        if (
            Number(allegato.consulente_id) !==
            Number(utente.id) ||
            Number(allegato.caricato_da) !==
            Number(utente.id)
        ) {
            return res.status(403).json({
                message:
                    "Puoi eliminare soltanto gli allegati della tua risposta"
            });
        }

        const [risultato] = await db.execute(
            `DELETE FROM allegati_consultazioni
             WHERE id = ?
               AND caricato_da = ?`,
            [
                attachmentId,
                utente.id
            ]
        );

        if (risultato.affectedRows === 0) {
            return res.status(404).json({
                message:
                    "Allegato non trovato"
            });
        }

        const filePath = path.join(
            __dirname,
            "../uploads/ticket-allegati",
            allegato.nome_file
        );

        /*
         * Il record è già eliminato dal database.
         * Se il file esiste, viene rimosso dal disco.
         */
        fs.unlink(
            filePath,
            (error) => {
                if (
                    error &&
                    error.code !== "ENOENT"
                ) {
                    console.error(
                        "Errore eliminazione file consultazione:",
                        error
                    );
                }
            }
        );

        return res.status(200).json({
            message:
                "Allegato eliminato correttamente"
        });
    } catch (error) {
        console.error(
            "Errore eliminazione allegato consultazione:",
            error
        );

        return res.status(500).json({
            message:
                "Errore interno del server"
        });
    }
}

async function deleteConsultationResponse(req, res) {
    let connection;

    try {
        const ticketId =
            Number(req.params.id);

        const consultationId =
            Number(req.params.consultationId);

        const utente = req.session.utente;

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0 ||
            !Number.isInteger(consultationId) ||
            consultationId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo della consultazione non valido"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        const [consultazioni] =
            await connection.execute(
                `SELECT
                    id,
                    consulente_id,
                    stato
                 FROM consultazioni_ticket
                 WHERE id = ?
                   AND ticket_id = ?
                 FOR UPDATE`,
                [
                    consultationId,
                    ticketId
                ]
            );

        if (consultazioni.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message:
                    "Consultazione non trovata"
            });
        }

        const consultazione =
            consultazioni[0];

        if (
            Number(consultazione.consulente_id) !==
            Number(utente.id)
        ) {
            await connection.rollback();

            return res.status(403).json({
                message:
                    "Puoi eliminare soltanto la tua risposta"
            });
        }

        if (
            consultazione.stato !==
            "risposta_ricevuta"
        ) {
            await connection.rollback();

            return res.status(409).json({
                message:
                    "Non è presente una risposta da eliminare"
            });
        }

        const [allegati] =
            await connection.execute(
                `SELECT nome_file
                 FROM allegati_consultazioni
                 WHERE consultazione_id = ?`,
                [consultationId]
            );

        await connection.execute(
            `DELETE FROM allegati_consultazioni
             WHERE consultazione_id = ?`,
            [consultationId]
        );

        await connection.execute(
            `UPDATE consultazioni_ticket
             SET
                risposta = NULL,
                stato = 'richiesta',
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [consultationId]
        );

        await connection.commit();

        allegati.forEach((allegato) => {
            const filePath = path.join(
                __dirname,
                "../uploads/ticket-allegati",
                allegato.nome_file
            );

            fs.unlink(filePath, () => { });
        });

        return res.status(200).json({
            message:
                "Risposta eliminata correttamente"
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Errore rollback:",
                    rollbackError
                );
            }
        }

        console.error(
            "Errore eliminazione risposta:",
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

module.exports = {
    createConsultation,
    getConsultations,
    getMyConsultations,
    respondConsultation,
    createAdditionalConsultationResponse,
    updateAdditionalConsultationResponse,
deleteAdditionalConsultationResponse,
    updateConsultation,
    deleteConsultation,
    deleteConsultationResponse,
    viewConsultationAttachment,
    deleteConsultationAttachment
};