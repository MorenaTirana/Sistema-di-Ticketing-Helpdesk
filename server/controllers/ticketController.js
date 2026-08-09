const db = require("../db");
const {
    createNotification
} = require("../services/notificationService");

const categorieConsentite = [
    "problema_tecnico",
    "accesso_account",
    "fatturazione",
    "informazioni",
    "altro"
];

async function createTicket(req, res) {
    try {
        const utente = req.session.utente;

        const {
            barca_id,
            tipo_richiesta,
            titolo,
            descrizione,
            categoria
        } = req.body;

        const tipiRichiestaConsentiti = [
            "garanzia",
            "ricambi",
            "servizio"
        ];

        // Soltanto il cliente può aprire un ticket
        if (utente.ruolo !== "utente") {
            return res.status(403).json({
                message:
                    "Solo un cliente può aprire un ticket"
            });
        }

        const barcaId = Number(barca_id);

        if (!Number.isInteger(barcaId) || barcaId <= 0) {
            return res.status(400).json({
                message: "Seleziona una barca valida"
            });
        }

        if (
            !titolo ||
            !descrizione ||
            !categoria ||
            !tipo_richiesta
        ) {
            return res.status(400).json({
                message:
                    "Tutti i dati del ticket sono obbligatori"
            });
        }

        if (
            !tipiRichiestaConsentiti.includes(
                tipo_richiesta
            )
        ) {
            return res.status(400).json({
                message:
                    "Tipo di richiesta non valido"
            });
        }

        const titoloPulito = titolo.trim();
        const descrizionePulita =
            descrizione.trim();

        if (titoloPulito.length < 5) {
            return res.status(400).json({
                message:
                    "Il titolo deve contenere almeno 5 caratteri"
            });
        }

        if (descrizionePulita.length < 10) {
            return res.status(400).json({
                message:
                    "La descrizione deve contenere almeno 10 caratteri"
            });
        }

        if (!categorieConsentite.includes(categoria)) {
            return res.status(400).json({
                message: "Categoria non valida"
            });
        }

        /*
         * Controlliamo che la barca selezionata appartenga
         * davvero all'utente collegato.
         */
        const [barche] = await db.execute(
            `SELECT id
             FROM barche
             WHERE id = ? AND utente_id = ?`,
            [barcaId, utente.id]
        );

        if (barche.length === 0) {
            return res.status(403).json({
                message:
                    "Non puoi aprire un ticket per questa barca"
            });
        }

        const [risultato] = await db.execute(
            `INSERT INTO ticket (
                utente_id,
                barca_id,
                titolo,
                descrizione,
                categoria,
                tipo_richiesta
             )
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                utente.id,
                barcaId,
                titoloPulito,
                descrizionePulita,
                categoria,
                tipo_richiesta
            ]
        );

        return res.status(201).json({
            message: "Ticket creato correttamente",

            ticket: {
                id: risultato.insertId,
                utente_id: utente.id,
                barca_id: barcaId,
                titolo: titoloPulito,
                descrizione: descrizionePulita,
                categoria,
                tipo_richiesta,
                copertura: "da_valutare",
                stato: "aperto"
            }
        });
    } catch (error) {
        console.error(
            "Errore durante la creazione del ticket:",
            error
        );

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
                t.priorita,
                t.created_at,
                t.updated_at,
                t.tipo_richiesta,
                t.copertura,
                t.costo,
                b.id AS barca_id,
                b.modello AS barca_modello,
                b.matricola AS barca_matricola,
                b.anno_produzione AS barca_anno_produzione,
                b.localizzazione AS barca_localizzazione,
                b.garanzia_attivata_il,
                b.garanzia_scadenza_il,
                u.id AS utente_id,
                u.nome AS utente_nome,
                u.cognome AS utente_cognome,
                u.email AS utente_email, 
                op.id AS operatore_id,
                op.nome AS operatore_nome,
                op.cognome AS operatore_cognome,
                op.email AS operatore_email

            FROM ticket AS t
            INNER JOIN utenti AS u
                ON t.utente_id = u.id
            LEFT JOIN barche AS b
                ON t.barca_id = b.id 
            LEFT JOIN utenti AS op
                ON t.operatore_id = op.id
        `;

        const parametri = [];

        if (utente.ruolo === "utente") {
            query += `
                WHERE t.utente_id = ?
            `;

            parametri.push(utente.id);
        }

        query += `
            ORDER BY
                CASE
                    WHEN t.stato IN ('aperto', 'in_lavorazione')
                        THEN 0
                    ELSE 1
                END,
                t.created_at ASC
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

async function getTicketById(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const utente = req.session.utente;

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message: "Identificativo del ticket non valido"
            });
        }

        const [risultati] = await db.execute(
            `SELECT
                t.id,
                t.titolo,
                t.descrizione,
                t.categoria,
                t.stato,
                t.priorita,
                t.created_at,
                t.updated_at,
                t.tipo_richiesta,
                t.copertura,
                t.costo,
                b.id AS barca_id,
                b.modello AS barca_modello,
                b.matricola AS barca_matricola,
                b.anno_produzione AS barca_anno_produzione,
                b.localizzazione AS barca_localizzazione,
                b.indirizzo_consegna AS barca_indirizzo_consegna,
                b.garanzia_attivata_il,
                b.garanzia_scadenza_il,
                u.id AS utente_id,
                u.nome AS utente_nome,
                u.cognome AS utente_cognome,
                u.email AS utente_email,
                op.id AS operatore_id,
                op.nome AS operatore_nome,
                op.cognome AS operatore_cognome,
                op.email AS operatore_email
             FROM ticket AS t
             INNER JOIN utenti AS u
                ON t.utente_id = u.id
             LEFT JOIN barche AS b
                ON t.barca_id = b.id
            LEFT JOIN utenti AS op
                ON t.operatore_id = op.id
             WHERE t.id = ?`,
            [ticketId]
        );

        if (risultati.length === 0) {
            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const ticket = risultati[0];

        if (
            utente.ruolo === "utente" &&
            ticket.utente_id !== utente.id
        ) {
            return res.status(403).json({
                message: "Non puoi visualizzare questo ticket"
            });
        }

        return res.status(200).json({
            ticket
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero del ticket:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function updateTicketStatus(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const { stato } = req.body;

        const statiConsentiti = [
            "aperto",
            "in_lavorazione",
            "risolto",
            "chiuso"
        ];

        // 1. Controllo dell'identificativo del ticket
        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message: "Identificativo del ticket non valido"
            });
        }

        // 2. Controllo dello stato ricevuto
        if (!statiConsentiti.includes(stato)) {
            return res.status(400).json({
                message: "Stato non valido"
            });
        }

        // 3. Recupero del ticket e del suo proprietario
        const [risultati] = await db.execute(
            `SELECT id, stato, utente_id
             FROM ticket
             WHERE id = ?`,
            [ticketId]
        );

        if (risultati.length === 0) {
            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const ticket = risultati[0];

        // 4. Evitiamo un aggiornamento inutile
        if (ticket.stato === stato) {
            return res.status(400).json({
                message: "Il ticket si trova già in questo stato"
            });
        }

        // 5. Aggiornamento dello stato nel database
        await db.execute(
            `UPDATE ticket
             SET stato = ?
             WHERE id = ?`,
            [stato, ticketId]
        );
        // Registriamo il cambio nello storico.
        await db.execute(
            `INSERT INTO storico_stati (
                ticket_id,
                operatore_id,
                stato_precedente,
                stato_nuovo
            )
            VALUES (?, ?, ?, ?)`,
            [
                ticketId,
                req.session.utente.id,
                ticket.stato,
                stato
            ]
        );

        // 6. Traduzione dello stato per il messaggio
        const nomiStato = {
            aperto: "Aperto",
            in_lavorazione: "In lavorazione",
            risolto: "Risolto",
            chiuso: "Chiuso"
        };

        // 7. Creazione della notifica per il proprietario
        await createNotification({
            utenteId: ticket.utente_id,
            ticketId: ticketId,
            tipo: "stato_modificato",
            messaggio:
                `Lo stato del ticket #${ticketId} è stato modificato in "${nomiStato[stato]}".`
        });

        // 8. Risposta inviata al frontend
        return res.status(200).json({
            message: "Stato aggiornato correttamente",
            ticket: {
                id: ticketId,
                stato
            }
        });
    } catch (error) {
        console.error(
            "Errore durante l'aggiornamento dello stato:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}


async function updateTicketManagement(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const utente = req.session.utente;

        const {
            copertura,
            costo,
            priorita
        } = req.body;

        const copertureConsentite = [
            "da_valutare",
            "in_garanzia",
            "fuori_garanzia"
        ];

        const prioritaConsentite = [
            "bassa",
            "media",
            "alta",
            "urgente"
        ];

        if (utente.ruolo !== "operatore") {
            return res.status(403).json({
                message:
                    "Operazione riservata agli operatori"
            });
        }

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        if (!copertureConsentite.includes(copertura)) {
            return res.status(400).json({
                message: "Copertura non valida"
            });
        }

        if (!prioritaConsentite.includes(priorita)) {
            return res.status(400).json({
                message: "Priorità non valida"
            });
        }

        const costoNormalizzato =
            costo === "" ||
                costo === null ||
                costo === undefined
                ? null
                : Number(costo);

        if (
            costoNormalizzato !== null &&
            (
                !Number.isFinite(costoNormalizzato) ||
                costoNormalizzato < 0
            )
        ) {
            return res.status(400).json({
                message: "Costo non valido"
            });
        }

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

        await db.execute(
            `UPDATE ticket
             SET copertura = ?,
                 costo = ?,
                 priorita = ?
             WHERE id = ?`,
            [
                copertura,
                costoNormalizzato,
                priorita,
                ticketId
            ]
        );

        const nomiCopertura = {
            da_valutare: "Da valutare",
            in_garanzia: "In garanzia",
            fuori_garanzia: "Fuori garanzia"
        };

        const nomiPriorita = {
            bassa: "Bassa",
            media: "Media",
            alta: "Alta",
            urgente: "Urgente"
        };

        const testoCosto =
            costoNormalizzato === null
                ? "non ancora definito"
                : `${costoNormalizzato.toFixed(2)} euro`;

        await createNotification({
            utenteId: ticket.utente_id,
            ticketId,
            tipo: "gestione_aggiornata",
            messaggio:
                `Il ticket #${ticketId} è stato aggiornato: ` +
                `priorità "${nomiPriorita[priorita]}", ` +
                `copertura "${nomiCopertura[copertura]}", ` +
                `costo ${testoCosto}.`
        });

        return res.status(200).json({
            message:
                "Gestione del ticket aggiornata correttamente",

            ticket: {
                id: ticketId,
                copertura,
                costo: costoNormalizzato,
                priorita
            }
        });
    } catch (error) {
        console.error(
            "Errore durante l'aggiornamento della gestione:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function assignTicket(req, res) {
    try {
        const ticketId = Number(req.params.id);
        const operatoreId = Number(req.body.operatore_id);

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message:
                    "Identificativo del ticket non valido"
            });
        }

        if (
            !Number.isInteger(operatoreId) ||
            operatoreId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Seleziona un operatore valido"
            });
        }

        // Recuperiamo il ticket e il suo proprietario.
        const [ticketTrovati] = await db.execute(
            `SELECT
                id,
                utente_id,
                operatore_id
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

        // Controlliamo che l'utente scelto
        // sia realmente un operatore.
        const [operatori] = await db.execute(
            `SELECT
                id,
                nome,
                cognome,
                email
             FROM utenti
             WHERE id = ?
               AND ruolo = 'operatore'`,
            [operatoreId]
        );

        if (operatori.length === 0) {
            return res.status(400).json({
                message:
                    "L'utente selezionato non è un operatore"
            });
        }

        if (ticket.operatore_id === operatoreId) {
            return res.status(400).json({
                message:
                    "Il ticket è già assegnato a questo operatore"
            });
        }

        const operatore = operatori[0];

        await db.execute(
            `UPDATE ticket
             SET operatore_id = ?
             WHERE id = ?`,
            [operatoreId, ticketId]
        );

        await createNotification({
            utenteId: ticket.utente_id,
            ticketId,
            tipo: "assegnazione",
            messaggio:
                `Il ticket #${ticketId} è stato assegnato ` +
                `all'operatore ${operatore.nome} ` +
                `${operatore.cognome}.`
        });

        return res.status(200).json({
            message:
                "Ticket assegnato correttamente",

            ticket: {
                id: ticketId,
                operatore: {
                    id: operatore.id,
                    nome: operatore.nome,
                    cognome: operatore.cognome,
                    email: operatore.email
                }
            }
        });
    } catch (error) {
        console.error(
            "Errore durante l'assegnazione del ticket:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    updateTicketStatus,
    updateTicketManagement,
    assignTicket
};