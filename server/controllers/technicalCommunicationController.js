const db = require("../db");

const {
    createNotification,
    createRoleNotifications
} = require("../services/notificationService");

async function createCommunicationDraft(req, res) {
    try {
        const operatore = req.session.utente;

        const {
            ticketId,
            valutazioneOrigineId,
            titolo,
            messaggio
        } = req.body;

        const ticketIdNumerico = Number(ticketId);

        if (
            !Number.isInteger(ticketIdNumerico) ||
            ticketIdNumerico <= 0
        ) {
            return res.status(400).json({
                message: "Identificativo del ticket non valido"
            });
        }

        if (!titolo || titolo.trim().length < 3) {
            return res.status(400).json({
                message: "Il titolo deve contenere almeno 3 caratteri"
            });
        }

        if (!messaggio || messaggio.trim().length < 5) {
            return res.status(400).json({
                message: "Il messaggio deve contenere almeno 5 caratteri"
            });
        }

        const [ticket] = await db.execute(
            `SELECT id
             FROM ticket
             WHERE id = ?`,
            [ticketIdNumerico]
        );

        if (ticket.length === 0) {
            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        let valutazioneId = null;

        if (valutazioneOrigineId) {
            valutazioneId = Number(valutazioneOrigineId);

            const [valutazioni] = await db.execute(
                `SELECT id
                 FROM valutazioni_tecniche
                 WHERE id = ?
                   AND ticket_id = ?`,
                [valutazioneId, ticketIdNumerico]
            );

            if (valutazioni.length === 0) {
                return res.status(400).json({
                    message:
                        "La valutazione tecnica non appartiene al ticket"
                });
            }
        }

        const [risultato] = await db.execute(
            `INSERT INTO comunicazioni_tecniche_cliente (
                ticket_id,
                valutazione_origine_id,
                operatore_id,
                titolo,
                messaggio,
                stato
             )
             VALUES (?, ?, ?, ?, ?, 'bozza')`,
            [
                ticketIdNumerico,
                valutazioneId,
                operatore.id,
                titolo.trim(),
                messaggio.trim()
            ]
        );

        return res.status(201).json({
            message: "Bozza della comunicazione creata",
            comunicazione: {
                id: risultato.insertId,
                ticket_id: ticketIdNumerico,
                titolo: titolo.trim(),
                stato: "bozza"
            }
        });
    } catch (error) {
        console.error(
            "Errore durante la creazione della comunicazione:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function sendCommunicationToClient(req, res) {
    let connection;

    try {
        const communicationId = Number(req.params.id);
        const operatore = req.session.utente;

        if (
            !Number.isInteger(communicationId) ||
            communicationId <= 0
        ) {
            return res.status(400).json({
                message: "Identificativo della comunicazione non valido"
            });
        }

        if (!operatore || operatore.ruolo !== "operatore") {
            return res.status(403).json({
                message: "Operazione consentita solamente agli operatori"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        /*
         * Recuperiamo:
         * - la comunicazione;
         * - il proprietario del ticket;
         * - il tecnico autore della valutazione.
         */
        const [comunicazioni] = await connection.execute(
            `SELECT
                c.id,
                c.ticket_id,
                c.valutazione_origine_id,
                c.titolo,
                c.messaggio,
                c.stato,
                t.utente_id AS cliente_id,
                vt.autore_id AS tecnico_id
             FROM comunicazioni_tecniche_cliente AS c
             INNER JOIN ticket AS t
                ON t.id = c.ticket_id
             LEFT JOIN valutazioni_tecniche AS vt
                ON vt.id = c.valutazione_origine_id
             WHERE c.id = ?
             FOR UPDATE`,
            [communicationId]
        );

        if (comunicazioni.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Comunicazione non trovata"
            });
        }

        const comunicazione = comunicazioni[0];

        if (comunicazione.stato === "inviata") {
            await connection.rollback();

            return res.status(400).json({
                message: "La comunicazione è già stata inviata"
            });
        }

        if (
            !comunicazione.messaggio ||
            comunicazione.messaggio.trim().length < 5
        ) {
            await connection.rollback();

            return res.status(400).json({
                message:
                    "Inserisci il messaggio per il cliente prima di inviarlo"
            });
        }

        // Registriamo l’invio della comunicazione
        await connection.execute(
            `UPDATE comunicazioni_tecniche_cliente
             SET
                stato = 'inviata',
                operatore_id = ?,
                inviata_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [operatore.id, communicationId]
        );

        const ticketId = comunicazione.ticket_id;

        /*
         * Un eventuale errore delle notifiche non deve
         * annullare l'invio già valido della comunicazione.
         */
        try {
            // Notifica per il cliente
            await createNotification({
                utenteId: comunicazione.cliente_id,
                ticketId,
                tipo: "comunicazione_cliente",
                messaggio:
                    `Hai ricevuto una nuova comunicazione relativa al ticket #${ticketId}.`,
                connection
            });

            // Notifica il tecnico che ha fornito la valutazione
            if (comunicazione.tecnico_id) {
                await createNotification({
                    utenteId: comunicazione.tecnico_id,
                    ticketId,
                    tipo: "comunicazione_cliente",
                    messaggio:
                        `La comunicazione relativa al ticket #${ticketId} ` +
                        `è stata inviata al cliente.`,
                    connection
                });
            }

            // Il capo produzione viene sempre informato
            await createRoleNotifications({
                ruolo: "capo_produzione",
                ticketId,
                tipo: "comunicazione_cliente",
                messaggio:
                    `L'operatore ${operatore.nome} ${operatore.cognome} ` +
                    `ha inviato al cliente una comunicazione relativa ` +
                    `al ticket #${ticketId}.`,
                connection
            });
        } catch (notificationError) {
            console.error(
                "Errore notifica comunicazione tecnica:",
                notificationError
            );
        }

        await connection.commit();

        return res.status(200).json({
            message: "Comunicazione inviata correttamente al cliente"
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Errore durante l'invio della comunicazione:",
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
    createCommunicationDraft,
    sendCommunicationToClient
};