const db = require("../db");


async function getOperators(req, res) {
    try {
        const [operatori] = await db.execute(
            `SELECT
                u.id,
                u.nome,
                u.cognome,
                u.email,
                COUNT(t.id) AS ticket_assegnati
             FROM utenti AS u
             LEFT JOIN ticket AS t
                ON t.operatore_id = u.id
                AND t.stato <> 'chiuso'
             WHERE u.ruolo = 'operatore'
             GROUP BY
                u.id,
                u.nome,
                u.cognome,
                u.email
             ORDER BY
                ticket_assegnati ASC,
                u.cognome ASC,
                u.nome ASC`
        );

        return res.status(200).json({
            operatori
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero degli operatori:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}


module.exports = {
    getOperators
};