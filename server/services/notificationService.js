const db = require("../db");

/*
 * Tipi di notifica utilizzati
 * dai controller dell'applicazione.
 */
const tipiConsentiti = [
    "commento_operatore",
    "feedback_operatore",
    "feedback_cliente",
    "conferma_cliente",
    "stato_modificato",
    "assegnazione",
    "gestione_aggiornata",
    "workflow_avanzato",
    "nuovo_ticket",
    "nuova_pratica",
    "assegnazione_tecnica",
    "valutazione_tecnica",
    "comunicazione_cliente",
    "spedizione_aggiornata",
    "escalation",
    "allarme_cliente",
    "consultazione_interna",
    "risposta_consultazione",
    "richiesta_interna",
    "risposta_interna"
];

function verificaTipo(tipo) {
    if (!tipiConsentiti.includes(tipo)) {
        throw new Error(
            `Tipo di notifica non valido: ${tipo}`
        );
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

    if (
        !Number.isInteger(Number(utenteId)) ||
        Number(utenteId) <= 0
    ) {
        throw new Error(
            "Identificativo del destinatario non valido"
        );
    }

    if (
        !Number.isInteger(Number(ticketId)) ||
        Number(ticketId) <= 0
    ) {
        throw new Error(
            "Identificativo del ticket non valido"
        );
    }

    if (
        typeof messaggio !== "string" ||
        messaggio.trim().length === 0
    ) {
        throw new Error(
            "Il messaggio della notifica è obbligatorio"
        );
    }

    /*
     * Nel database il messaggio è VARCHAR(255).
     * Evita errori se un testo supera il limite.
     */
    const messaggioPulito =
        messaggio.trim().slice(0, 255);

    const [risultato] = await connection.execute(
        `INSERT INTO notifiche (
            utente_id,
            ticket_id,
            tipo,
            messaggio
         )
         VALUES (?, ?, ?, ?)`,
        [
            Number(utenteId),
            Number(ticketId),
            tipo,
            messaggioPulito
        ]
    );

    return {
        id: risultato.insertId,
        utente_id: Number(utenteId),
        ticket_id: Number(ticketId),
        tipo,
        messaggio: messaggioPulito
    };
}

async function createRoleNotifications({
    ruolo,
    ticketId,
    tipo,
    messaggio,
    connection = db
}) {
    verificaTipo(tipo);

    if (
        typeof ruolo !== "string" ||
        ruolo.trim().length === 0
    ) {
        throw new Error(
            "Il ruolo destinatario è obbligatorio"
        );
    }

    const [utenti] = await connection.execute(
        `SELECT id
         FROM utenti
         WHERE ruolo = ?
           AND attivo = 1`,
        [ruolo.trim()]
    );

    const notificheCreate = [];

    for (const utente of utenti) {
        const notifica = await createNotification({
            utenteId: utente.id,
            ticketId,
            tipo,
            messaggio,
            connection
        });

        notificheCreate.push(notifica);
    }

    return notificheCreate;
}

module.exports = {
    createNotification,
    createRoleNotifications
};