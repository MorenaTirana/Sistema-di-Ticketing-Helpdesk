const db = require("../db");

async function checkTicketAccess(ticketId, utente) {
    const [risultati] = await db.execute(
        `SELECT id, utente_id
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
        ticket.utente_id !== utente.id
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

async function getComments(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const utente = req.session.utente;

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message: "Identificativo del ticket non valido"
            });
        }

        const accesso = await checkTicketAccess(ticketId, utente);

        if (!accesso.allowed) {
            return res.status(accesso.status).json({
                message: accesso.message
            });
        }

        const [commenti] = await db.execute(
            `SELECT
                c.id,
                c.testo,
                c.created_at,
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

        return res.status(200).json({
            commenti
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero dei commenti:",
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

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message: "Identificativo del ticket non valido"
            });
        }

        if (!testo || testo.trim().length < 2) {
            return res.status(400).json({
                message: "Il commento deve contenere almeno 2 caratteri"
            });
        }

        if (testo.trim().length > 2000) {
            return res.status(400).json({
                message: "Il commento non può superare 2000 caratteri"
            });
        }

        const accesso = await checkTicketAccess(ticketId, utente);

        if (!accesso.allowed) {
            return res.status(accesso.status).json({
                message: accesso.message
            });
        }

        const testoPulito = testo.trim();

        const [risultato] = await db.execute(
            `INSERT INTO commenti
                (ticket_id, utente_id, testo)
             VALUES (?, ?, ?)`,
            [ticketId, utente.id, testoPulito]
        );

        return res.status(201).json({
            message: "Commento aggiunto",
            commento: {
                id: risultato.insertId,
                ticket_id: ticketId,
                utente_id: utente.id,
                utente_nome: utente.nome,
                utente_cognome: utente.cognome,
                utente_ruolo: utente.ruolo,
                testo: testoPulito
            }
        });
    } catch (error) {
        console.error(
            "Errore durante la creazione del commento:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    getComments,
    createComment
};