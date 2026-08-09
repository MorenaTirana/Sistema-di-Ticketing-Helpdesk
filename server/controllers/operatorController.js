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

async function getClients(req, res) {
    try {
        const [clienti] = await db.execute(
            `SELECT
                u.id,
                u.nome,
                u.cognome,
                u.email,
                u.telefono,
                COUNT(DISTINCT b.id) AS numero_barche,
                COUNT(
                    DISTINCT CASE
                        WHEN t.stato <> 'chiuso'
                        THEN t.id
                    END
                ) AS ticket_attivi
             FROM utenti AS u
             LEFT JOIN barche AS b
                ON b.utente_id = u.id
             LEFT JOIN ticket AS t
                ON t.utente_id = u.id
             WHERE u.ruolo = 'utente'
             GROUP BY
                u.id,
                u.nome,
                u.cognome,
                u.email,
                u.telefono
             ORDER BY
                u.cognome ASC,
                u.nome ASC`
        );

        return res.status(200).json({
            clienti
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero dei clienti:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    getOperators,
    getClients
};