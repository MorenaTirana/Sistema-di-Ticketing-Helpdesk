const path = require("path");
const db = require("../db");

const {
    createNotification
} = require("../services/notificationService");

async function createInternalRequest(req, res) {
    let connection;

    try {
        const autore =
            req.session.utente;

        const {
            ticketId,
            assegnatoA,
            richiesta
        } = req.body;

        const ticketIdNumerico =
            Number(ticketId);

        const assegnatoAId =
            Number(assegnatoA);

        if (
            !Number.isInteger(ticketIdNumerico) ||
            ticketIdNumerico <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        if (
            !Number.isInteger(assegnatoAId) ||
            assegnatoAId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Seleziona un operatore valido"
            });
        }

        if (
            !richiesta ||
            richiesta.trim().length < 5
        ) {
            return res.status(400).json({
                message:
                    "Scrivi cosa richiedi all’operatore"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [ticket] =
            await connection.execute(
                `SELECT id
                 FROM ticket
                 WHERE id = ?
                 FOR UPDATE`,
                [ticketIdNumerico]
            );

        if (ticket.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const [operatori] =
            await connection.execute(
                `SELECT
                    id,
                    nome,
                    cognome,
                    attivo
                 FROM utenti
                 WHERE id = ?
                   AND ruolo = 'operatore'`,
                [assegnatoAId]
            );

        if (
            operatori.length === 0 ||
            !operatori[0].attivo
        ) {
            await connection.rollback();

            return res.status(400).json({
                message:
                    "L’operatore selezionato non è attivo"
            });
        }

        await connection.execute(
            `UPDATE ticket
             SET operatore_id = ?
             WHERE id = ?`,
            [
                assegnatoAId,
                ticketIdNumerico
            ]
        );

        const [risultato] =
            await connection.execute(
                `INSERT INTO richieste_interne_ticket (
                    ticket_id,
                    richiesto_da,
                    assegnato_a,
                    richiesta,
                    stato
                 )
                 VALUES (?, ?, ?, ?, 'in_attesa')`,
                [
                    ticketIdNumerico,
                    autore.id,
                    assegnatoAId,
                    richiesta.trim()
                ]
            );

        try {
            await createNotification({
                utenteId: assegnatoAId,
                ticketId: ticketIdNumerico,
                tipo: "richiesta_interna",
                messaggio:
                    `${autore.nome} ${autore.cognome} ` +
                    `ti ha assegnato il ticket ` +
                    `#${ticketIdNumerico} con una richiesta interna.`,
                connection
            });
        } catch (notificationError) {
            console.error(
                "Errore notifica richiesta interna:",
                notificationError
            );
        }

        await connection.commit();

        return res.status(201).json({
            message:
                "Ticket assegnato e richiesta interna inviata",

            richiesta: {
                id: risultato.insertId,
                ticket_id: ticketIdNumerico,
                assegnato_a: assegnatoAId,
                testo: richiesta.trim(),
                stato: "in_attesa"
            }
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Errore creazione richiesta interna:",
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

async function getTicketInternalRequests(
    req,
    res
) {
    try {
        const ticketId =
            Number(req.params.ticketId);

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        const [richieste] =
            await db.execute(
                `SELECT
                    r.id,
                    r.ticket_id,
                    r.richiesto_da,
                    r.assegnato_a,
                    r.richiesta,
                    r.stato,
                    r.created_at,
                    r.updated_at,
                    autore.nome AS autore_nome,
                    autore.cognome AS autore_cognome,
                    destinatario.nome AS destinatario_nome,
                    destinatario.cognome AS destinatario_cognome,
                    destinatario.funzione AS destinatario_funzione
                 FROM richieste_interne_ticket AS r
                 INNER JOIN utenti AS autore
                    ON autore.id = r.richiesto_da
                 INNER JOIN utenti AS destinatario
                    ON destinatario.id = r.assegnato_a
                 WHERE r.ticket_id = ?
                 ORDER BY r.created_at DESC`,
                [ticketId]
            );

        for (const richiesta of richieste) {
            const [risposte] =
                await db.execute(
                    `SELECT
                        risposta.id,
                        risposta.richiesta_interna_id,
                        risposta.autore_id,
                        risposta.testo,
                        risposta.nome_file_originale,
                        risposta.mime_type,
                        risposta.dimensione_file,
                        risposta.visibile_cliente,
                        risposta.created_at,
                        autore.nome AS autore_nome,
                        autore.cognome AS autore_cognome,
                        autore.funzione AS autore_funzione
                     FROM risposte_interne_ticket AS risposta
                     INNER JOIN utenti AS autore
                        ON autore.id = risposta.autore_id
                     WHERE risposta.richiesta_interna_id = ?
                     ORDER BY risposta.created_at ASC`,
                    [richiesta.id]
                );

            richiesta.risposte = risposte;
        }

        return res.status(200).json({
            richieste
        });
    } catch (error) {
        console.error(
            "Errore recupero richieste interne:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function createInternalReply(req, res) {
    let connection;

    try {
        const richiestaId =
            Number(req.params.id);

        const autore =
            req.session.utente;

        const testo =
            req.body.testo
                ? req.body.testo.trim()
                : "";

        const file =
            req.file || null;

        if (
            !Number.isInteger(richiestaId) ||
            richiestaId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo della richiesta non valido"
            });
        }

        if (!testo && !file) {
            return res.status(400).json({
                message:
                    "Inserisci una risposta oppure un allegato"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [richieste] =
            await connection.execute(
                `SELECT
                    id,
                    ticket_id,
                    richiesto_da,
                    assegnato_a
                 FROM richieste_interne_ticket
                 WHERE id = ?
                 FOR UPDATE`,
                [richiestaId]
            );

        if (richieste.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message:
                    "Richiesta interna non trovata"
            });
        }

        const richiesta =
            richieste[0];

        const autorizzato =
            Number(autore.id) ===
                Number(richiesta.assegnato_a) ||
            Number(autore.id) ===
                Number(richiesta.richiesto_da) ||
            Boolean(
                autore.puo_gestire_operatori
            );

        if (!autorizzato) {
            await connection.rollback();

            return res.status(403).json({
                message:
                    "Non puoi rispondere a questa richiesta"
            });
        }

        const [risultato] =
            await connection.execute(
                `INSERT INTO risposte_interne_ticket (
                    richiesta_interna_id,
                    autore_id,
                    testo,
                    nome_file_originale,
                    nome_file_salvato,
                    mime_type,
                    dimensione_file,
                    visibile_cliente
                 )
                 VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
                [
                    richiestaId,
                    autore.id,
                    testo || null,
                    file
                        ? file.originalname
                        : null,
                    file
                        ? file.filename
                        : null,
                    file
                        ? file.mimetype
                        : null,
                    file
                        ? file.size
                        : null
                ]
            );

        await connection.execute(
            `UPDATE richieste_interne_ticket
             SET stato = 'risposta_ricevuta'
             WHERE id = ?`,
            [richiestaId]
        );

        const destinatarioNotifica =
            Number(autore.id) ===
            Number(richiesta.richiesto_da)
                ? richiesta.assegnato_a
                : richiesta.richiesto_da;

        try {
            await createNotification({
                utenteId: destinatarioNotifica,
                ticketId: richiesta.ticket_id,
                tipo: "risposta_interna",
                messaggio:
                    `${autore.nome} ${autore.cognome} ` +
                    `ha risposto alla richiesta interna ` +
                    `del ticket #${richiesta.ticket_id}.`,
                connection
            });
        } catch (notificationError) {
            console.error(
                "Errore notifica risposta interna:",
                notificationError
            );
        }

        await connection.commit();

        return res.status(201).json({
            message:
                "Risposta interna inviata correttamente",

            risposta: {
                id: risultato.insertId
            }
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Errore creazione risposta interna:",
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

async function viewInternalReplyFile(req, res) {
    try {
        const replyId =
            Number(req.params.replyId);

        const utente =
            req.session.utente;

        const [risposte] =
            await db.execute(
                `SELECT
                    risposta.nome_file_salvato,
                    risposta.nome_file_originale,
                    risposta.mime_type,
                    risposta.visibile_cliente,
                    ticket.utente_id AS cliente_id
                 FROM risposte_interne_ticket AS risposta
                 INNER JOIN richieste_interne_ticket AS richiesta
                    ON richiesta.id =
                       risposta.richiesta_interna_id
                 INNER JOIN ticket
                    ON ticket.id = richiesta.ticket_id
                 WHERE risposta.id = ?`,
                [replyId]
            );

        if (risposte.length === 0) {
            return res.status(404).json({
                message: "File non trovato"
            });
        }

        const risposta =
            risposte[0];

        const operatore =
            utente.ruolo === "operatore";

        const clienteAutorizzato =
            utente.ruolo === "utente" &&
            Number(utente.id) ===
                Number(risposta.cliente_id) &&
            Boolean(
                risposta.visibile_cliente
            );

        if (
            !operatore &&
            !clienteAutorizzato
        ) {
            return res.status(403).json({
                message:
                    "Non puoi visualizzare questo file"
            });
        }

        if (!risposta.nome_file_salvato) {
            return res.status(404).json({
                message:
                    "La risposta non contiene un file"
            });
        }

        const nomeSicuro =
            path.basename(
                risposta.nome_file_salvato
            );

        const percorso =
            path.join(
                __dirname,
                "../uploads/ticket-allegati",
                nomeSicuro
            );

        res.type(
            risposta.mime_type ||
            "application/octet-stream"
        );

        return res.sendFile(percorso);
    } catch (error) {
        console.error(
            "Errore visualizzazione file interno:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function shareInternalReplyWithClient(
    req,
    res
) {
    try {
        const replyId =
            Number(req.params.replyId);

        if (
            !Number.isInteger(replyId) ||
            replyId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo della risposta non valido"
            });
        }

        const [risposte] =
            await db.execute(
                `SELECT
                    risposta.id,
                    risposta.nome_file_salvato,
                    richiesta.ticket_id,
                    ticket.utente_id AS cliente_id
                 FROM risposte_interne_ticket AS risposta
                 INNER JOIN richieste_interne_ticket AS richiesta
                    ON richiesta.id =
                       risposta.richiesta_interna_id
                 INNER JOIN ticket
                    ON ticket.id = richiesta.ticket_id
                 WHERE risposta.id = ?`,
                [replyId]
            );

        if (risposte.length === 0) {
            return res.status(404).json({
                message:
                    "Risposta interna non trovata"
            });
        }

        if (!risposte[0].nome_file_salvato) {
            return res.status(400).json({
                message:
                    "La risposta non contiene un documento"
            });
        }

        await db.execute(
            `UPDATE risposte_interne_ticket
             SET visibile_cliente = TRUE
             WHERE id = ?`,
            [replyId]
        );

        try {
            await createNotification({
                utenteId:
                    risposte[0].cliente_id,

                ticketId:
                    risposte[0].ticket_id,

                tipo:
                    "documento_tecnico",

                messaggio:
                    `È disponibile un nuovo documento ` +
                    `per il ticket #${risposte[0].ticket_id}.`
            });
        } catch (notificationError) {
            console.error(
                "Errore notifica documento condiviso:",
                notificationError
            );
        }

        return res.status(200).json({
            message:
                "Documento reso visibile al cliente"
        });
    } catch (error) {
        console.error(
            "Errore condivisione documento:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function completeInternalRequest(req, res) {
    try {
        const richiestaId =
            Number(req.params.id);

        const [risultato] =
            await db.execute(
                `UPDATE richieste_interne_ticket
                 SET stato = 'completata'
                 WHERE id = ?`,
                [richiestaId]
            );

        if (risultato.affectedRows === 0) {
            return res.status(404).json({
                message:
                    "Richiesta interna non trovata"
            });
        }

        return res.status(200).json({
            message:
                "Richiesta interna completata"
        });
    } catch (error) {
        console.error(
            "Errore completamento richiesta:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    createInternalRequest,
    getTicketInternalRequests,
    createInternalReply,
    viewInternalReplyFile,
    shareInternalReplyWithClient,
    completeInternalRequest
};