const db = require("../db");

const tipiConsentiti = [
    "commento_operatore",
    "stato_modificato",
    "assegnazione",
    "gestione_aggiornata",
    "workflow_avanzato",
    "nuova_pratica",
    "assegnazione_tecnica",
    "valutazione_tecnica",
    "comunicazione_cliente",
    "spedizione_aggiornata",
    "escalation",
    "allarme_cliente",
    "consultazione_interna",
    "risposta_consultazione"
];

function verificaTipo(tipo) {
    if (!tipiConsentiti.includes(tipo)) {
        throw new Error("Tipo di notifica non valido");
    }
}

async function createNotification({
    utenteId,
    ticketId,
    tipo,
    messaggio,
    connection = db
}) {
    verificaTipo(tipo);

    await connection.execute(
        `INSERT INTO notifiche (
            utente_id,
            ticket_id,
            tipo,
            messaggio
         )
         VALUES (?, ?, ?, ?)`,
        [
            utenteId,
            ticketId,
            tipo,
            messaggio
        ]
    );
}

async function createRoleNotifications({
    ruolo,
    ticketId,
    tipo,
    messaggio,
    connection = db
}) {
    verificaTipo(tipo);

    const [utenti] = await connection.execute(
        `SELECT id
         FROM utenti
         WHERE ruolo = ?`,
        [ruolo]
    );

    for (const utente of utenti) {
        await createNotification({
            utenteId: utente.id,
            ticketId,
            tipo,
            messaggio,
            connection
        });
    }
}

module.exports = {
    createNotification,
    createRoleNotifications
};