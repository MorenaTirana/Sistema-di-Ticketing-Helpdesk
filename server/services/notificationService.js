const db = require("../db");

async function createNotification({
    utenteId,
    ticketId,
    tipo,
    messaggio
}) {
    const tipiConsentiti = [
    "commento_operatore",
    "stato_modificato",
    "assegnazione",
    "gestione_aggiornata"
];


    if (!tipiConsentiti.includes(tipo)) {
        throw new Error("Tipo di notifica non valido");
    }

    await db.execute(
        `INSERT INTO notifiche
            (utente_id, ticket_id, tipo, messaggio)
         VALUES (?, ?, ?, ?)`,
        [
            utenteId,
            ticketId,
            tipo,
            messaggio
        ]
    );
}

module.exports = {
    createNotification
};