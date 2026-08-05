const db = require("../db");

const categorieConsentite = [
    "problema_tecnico",
    "accesso_account",
    "fatturazione",
    "informazioni",
    "altro"
];

async function createTicket(req, res) {
    try {
        const { titolo, descrizione, categoria } = req.body;
        const utenteId = req.session.utente.id;

        if (!titolo || !descrizione || !categoria) {
            return res.status(400).json({
                message: "Titolo, descrizione e categoria sono obbligatori"
            });
        }

        const titoloPulito = titolo.trim();
        const descrizionePulita = descrizione.trim();

        if (titoloPulito.length < 5) {
            return res.status(400).json({
                message: "Il titolo deve contenere almeno 5 caratteri"
            });
        }

        if (descrizionePulita.length < 10) {
            return res.status(400).json({
                message: "La descrizione deve contenere almeno 10 caratteri"
            });
        }

        if (!categorieConsentite.includes(categoria)) {
            return res.status(400).json({
                message: "Categoria non valida"
            });
        }

        const [risultato] = await db.execute(
            `INSERT INTO ticket
                (utente_id, titolo, descrizione, categoria)
             VALUES (?, ?, ?, ?)`,
            [
                utenteId,
                titoloPulito,
                descrizionePulita,
                categoria
            ]
        );

        return res.status(201).json({
            message: "Ticket creato correttamente",
            ticket: {
                id: risultato.insertId,
                utente_id: utenteId,
                titolo: titoloPulito,
                descrizione: descrizionePulita,
                categoria,
                stato: "aperto"
            }
        });
    } catch (error) {
        console.error("Errore durante la creazione del ticket:", error);

        return res.status(500).json({
            message: "Errore interno del server"
        });
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
                t.created_at,
                t.updated_at,
                u.id AS utente_id,
                u.nome AS utente_nome,
                u.cognome AS utente_cognome,
                u.email AS utente_email
            FROM ticket AS t
            INNER JOIN utenti AS u
                ON t.utente_id = u.id
        `;

        const parametri = [];

        if (utente.ruolo === "utente") {
            query += `
                WHERE t.utente_id = ?
            `;

            parametri.push(utente.id);
        }

        query += `
            ORDER BY t.created_at DESC
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
module.exports = {
    createTicket, 
    getTickets
};