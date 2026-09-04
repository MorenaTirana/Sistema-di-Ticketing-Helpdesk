const db = require("../db");

const {
    createNotification
} = require("../services/notificationService");

async function checkTicketAccess(ticketId, utente) {
    const [risultati] = await db.execute(
        `SELECT
            id,
            utente_id,
            operatore_id,
            stato
         FROM ticket
         WHERE id = ?`,
        [ticketId]
    );

    if (risultati.length === 0) {
        return {
            allowed: false,
            status: 404,
            message: "Ticket non trovato"
        };
    }

    const ticket = risultati[0];

    if (
        utente.ruolo === "utente" &&
        Number(ticket.utente_id) !== Number(utente.id)
    ) {
        return {
            allowed: false,
            status: 403,
            message: "Non puoi accedere a questo ticket"
        };
    }

    return {
        allowed: true,
        ticket
    };
}

function validateText(testo) {
    if (
        typeof testo !== "string" ||
        testo.trim().length < 2
    ) {
        return {
            valid: false,
            message:
                "Il feedback deve contenere almeno 2 caratteri"
        };
    }

    if (testo.trim().length > 2000) {
        return {
            valid: false,
            message:
                "Il feedback non può superare 2000 caratteri"
        };
    }

    return {
        valid: true,
        testoPulito: testo.trim()
    };
}

async function getComments(req, res) {
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

        const accesso = await checkTicketAccess(
            ticketId,
            utente
        );

        if (!accesso.allowed) {
            return res
                .status(accesso.status)
                .json({
                    message: accesso.message
                });
        }

        const [commenti] = await db.execute(
            `SELECT
                c.id,
                c.ticket_id,
                c.testo,
                c.created_at,
                c.updated_at,
                u.id AS utente_id,
                u.nome AS utente_nome,
                u.cognome AS utente_cognome,
                u.ruolo AS utente_ruolo
             FROM commenti AS c
             INNER JOIN utenti AS u
                ON c.utente_id = u.id
             WHERE c.ticket_id = ?
             ORDER BY c.created_at ASC`,
            [ticketId]
        );

        const feedback = commenti.map(
            (commento) => ({
                ...commento,

                tipo_feedback:
                    commento.utente_ruolo === "operatore"
                        ? "operatore"
                        : "cliente",

                modificabile:
                    Number(commento.utente_id) ===
                    Number(utente.id),

                eliminabile:
                    Number(commento.utente_id) ===
                    Number(utente.id)
            })
        );

        return res.status(200).json({
            commenti: feedback
        });
    } catch (error) {
        console.error(
            "Errore recupero feedback:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function createComment(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const utente = req.session.utente;
        const { testo } = req.body;

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        const validazione = validateText(testo);

        if (!validazione.valid) {
            return res.status(400).json({
                message: validazione.message
            });
        }

        const accesso = await checkTicketAccess(
            ticketId,
            utente
        );

        if (!accesso.allowed) {
            return res
                .status(accesso.status)
                .json({
                    message: accesso.message
                });
        }

        const [risultato] = await db.execute(
            `INSERT INTO commenti (
                ticket_id,
                utente_id,
                testo
             )
             VALUES (?, ?, ?)`,
            [
                ticketId,
                utente.id,
                validazione.testoPulito
            ]
        );

        if (utente.ruolo === "operatore") {
            await createNotification({
                utenteId:
                    accesso.ticket.utente_id,

                ticketId,

                tipo: "feedback_operatore",

                messaggio:
                    `Hai ricevuto un feedback ` +
                    `dall'operatore per il ticket ` +
                    `#${ticketId}.`
            });
        } else if (accesso.ticket.operatore_id) {
            await createNotification({
                utenteId:
                    accesso.ticket.operatore_id,

                ticketId,

                tipo: "feedback_cliente",

                messaggio:
                    `${utente.nome} ${utente.cognome} ` +
                    `ha inviato un feedback per il ` +
                    `ticket #${ticketId}.`
            });
        }

        return res.status(201).json({
            message: "Feedback inviato",

            commento: {
                id: risultato.insertId,
                ticket_id: ticketId,
                utente_id: utente.id,
                utente_nome: utente.nome,
                utente_cognome: utente.cognome,
                utente_ruolo: utente.ruolo,
                tipo_feedback:
                    utente.ruolo === "operatore"
                        ? "operatore"
                        : "cliente",
                testo: validazione.testoPulito,
                modificabile: true,
                eliminabile: true
            }
        });
    } catch (error) {
        console.error(
            "Errore creazione feedback:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function updateComment(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const commentId = Number(req.params.commentId);
        const utente = req.session.utente;
        const { testo } = req.body;

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0 ||
            !Number.isInteger(commentId) ||
            commentId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo del feedback non valido"
            });
        }

        const validazione = validateText(testo);

        if (!validazione.valid) {
            return res.status(400).json({
                message: validazione.message
            });
        }

        const accesso = await checkTicketAccess(
            ticketId,
            utente
        );

        if (!accesso.allowed) {
            return res
                .status(accesso.status)
                .json({
                    message: accesso.message
                });
        }

        const [commenti] = await db.execute(
            `SELECT id, utente_id
             FROM commenti
             WHERE id = ?
               AND ticket_id = ?`,
            [commentId, ticketId]
        );

        if (commenti.length === 0) {
            return res.status(404).json({
                message: "Feedback non trovato"
            });
        }

        if (
            Number(commenti[0].utente_id) !==
            Number(utente.id)
        ) {
            return res.status(403).json({
                message:
                    "Puoi modificare solamente i tuoi feedback"
            });
        }

        await db.execute(
            `UPDATE commenti
             SET
                testo = ?,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?
               AND ticket_id = ?`,
            [
                validazione.testoPulito,
                commentId,
                ticketId
            ]
        );

        return res.status(200).json({
            message: "Feedback modificato"
        });
    } catch (error) {
        console.error(
            "Errore modifica feedback:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function deleteComment(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const commentId = Number(req.params.commentId);
        const utente = req.session.utente;

        if (
            !Number.isInteger(ticketId) ||
            ticketId <= 0 ||
            !Number.isInteger(commentId) ||
            commentId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo del feedback non valido"
            });
        }

        const accesso = await checkTicketAccess(
            ticketId,
            utente
        );

        if (!accesso.allowed) {
            return res
                .status(accesso.status)
                .json({
                    message: accesso.message
                });
        }

        const [commenti] = await db.execute(
            `SELECT id, utente_id
             FROM commenti
             WHERE id = ?
               AND ticket_id = ?`,
            [commentId, ticketId]
        );

        if (commenti.length === 0) {
            return res.status(404).json({
                message: "Feedback non trovato"
            });
        }

        if (
            Number(commenti[0].utente_id) !==
            Number(utente.id)
        ) {
            return res.status(403).json({
                message:
                    "Puoi eliminare solamente i tuoi feedback"
            });
        }

        await db.execute(
            `DELETE FROM commenti
             WHERE id = ?
               AND ticket_id = ?`,
            [commentId, ticketId]
        );

        return res.status(200).json({
            message: "Feedback eliminato"
        });
    } catch (error) {
        console.error(
            "Errore eliminazione feedback:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    getComments,
    createComment,
    updateComment,
    deleteComment
};