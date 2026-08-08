const db = require("../db");

// Restituisce le notifiche dell'utente che ha effettuato l'accesso
async function getNotifications(req, res) {
    try {
        const utenteId = req.session.utente.id;

        const [notifiche] = await db.execute(
            `SELECT
                n.id,
                n.ticket_id,
                n.tipo,
                n.messaggio,
                n.letta,
                n.created_at
             FROM notifiche AS n
             WHERE n.utente_id = ?
             ORDER BY n.letta ASC, n.created_at DESC`,
            [utenteId]
        );

        return res.status(200).json({
            notifiche
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero delle notifiche:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

// Segna una notifica come letta
async function markNotificationAsRead(req, res) {
    try {
        const notificaId = Number(req.params.id);
        const utenteId = req.session.utente.id;

        if (!Number.isInteger(notificaId) || notificaId <= 0) {
            return res.status(400).json({
                message: "Identificativo della notifica non valido"
            });
        }

        const [risultato] = await db.execute(
            `UPDATE notifiche
             SET letta = TRUE
             WHERE id = ? AND utente_id = ?`,
            [notificaId, utenteId]
        );

        if (risultato.affectedRows === 0) {
            return res.status(404).json({
                message: "Notifica non trovata"
            });
        }

        return res.status(200).json({
            message: "Notifica segnata come letta"
        });
    } catch (error) {
        console.error(
            "Errore durante l'aggiornamento della notifica:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    getNotifications,
    markNotificationAsRead
};