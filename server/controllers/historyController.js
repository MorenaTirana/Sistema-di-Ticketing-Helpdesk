const db = require("../db");


async function getTicketHistory(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const utente = req.session.utente;

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        /*
         * Prima controlliamo che il ticket esista
         * e che l'utente abbia il diritto di vederlo.
         */
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

        if (
            utente.ruolo === "utente" &&
            ticket.utente_id !== utente.id
        ) {
            return res.status(403).json({
                message:
                    "Non puoi visualizzare questo storico"
            });
        }

        const [storico] = await db.execute(
            `SELECT
                s.id,
                s.ticket_id,
                s.stato_precedente,
                s.stato_nuovo,
                s.created_at,
                u.id AS operatore_id,
                u.nome AS operatore_nome,
                u.cognome AS operatore_cognome
             FROM storico_stati AS s
             LEFT JOIN utenti AS u
                ON s.operatore_id = u.id
             WHERE s.ticket_id = ?
             ORDER BY s.created_at ASC`,
            [ticketId]
        );

        return res.status(200).json({
            storico
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero dello storico:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}


module.exports = {
    getTicketHistory
};