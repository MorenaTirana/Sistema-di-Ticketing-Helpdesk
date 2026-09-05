const bcrypt = require("bcryptjs");
const db = require("../db");

async function getOperators(req, res) {
    try {
        const [operatoriAfterSales] =
            await db.execute(
                `SELECT
                    u.id,
                    u.nome,
                    u.cognome,
                    u.email,
                    u.funzione,
                    u.tipo_operatore,
                    COUNT(t.id) AS ticket_assegnati
                 FROM utenti AS u
                 LEFT JOIN ticket AS t
                    ON t.operatore_id = u.id
                    AND t.stato <> 'chiuso'
                 WHERE u.ruolo = 'operatore'
                   AND u.tipo_operatore = 'after_sales'
                   AND u.attivo = TRUE
                 GROUP BY
                    u.id,
                    u.nome,
                    u.cognome,
                    u.email,
                    u.funzione,
                    u.tipo_operatore
                 ORDER BY
                    ticket_assegnati ASC,
                    u.cognome ASC,
                    u.nome ASC`
            );

        const [consulenti] =
            await db.execute(
                `SELECT
                    u.id,
                    u.nome,
                    u.cognome,
                    u.email,
                    u.funzione,
                    u.tipo_operatore,
                    COUNT(ct.id) AS consultazioni_attive
                 FROM utenti AS u
                 LEFT JOIN consultazioni_ticket AS ct
                    ON ct.consulente_id = u.id
                    AND ct.stato <> 'completata'
                 WHERE u.ruolo <> 'utente'
  AND u.attivo = TRUE
  AND u.id <> ?
                 GROUP BY
                    u.id,
                    u.nome,
                    u.cognome,
                    u.email,
                    u.funzione,
                    u.tipo_operatore
                 ORDER BY
                    u.funzione ASC,
                    u.cognome ASC,
                    u.nome ASC`,
                [req.session.utente.id]
            );

        return res.status(200).json({
            // Mantiene compatibile l’assegnazione attuale
            operatori: operatoriAfterSales,

            operatori_after_sales:
                operatoriAfterSales,

            consulenti
        });
    } catch (error) {
        console.error(
            "Errore recupero operatori:",
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
            "Errore recupero clienti:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function createOperator(req, res) {
    try {
        const {
            nome,
            cognome,
            email,
            telefono,
            funzione,
            password,
            conferma_password
        } = req.body;

        if (
            !nome ||
            !cognome ||
            !email ||
            !telefono ||
            !funzione ||
            !password ||
            !conferma_password
        ) {
            return res.status(400).json({
                message:
                    "Tutti i campi sono obbligatori"
            });
        }

        const nomePulito =
            nome.trim();

        const cognomePulito =
            cognome.trim();

        const emailNormalizzata =
            email.trim().toLowerCase();

        const telefonoPulito =
            telefono.trim();

        const funzionePulita =
            funzione.trim();

        if (
            nomePulito.length < 2 ||
            cognomePulito.length < 2
        ) {
            return res.status(400).json({
                message:
                    "Nome e cognome non validi"
            });
        }

        if (telefonoPulito.length < 7) {
            return res.status(400).json({
                message:
                    "Numero di telefono non valido"
            });
        }

        if (
            funzionePulita.length < 2 ||
            funzionePulita.length > 100
        ) {
            return res.status(400).json({
                message:
                    "Funzione aziendale non valida"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message:
                    "La password deve contenere almeno 8 caratteri"
            });
        }

        if (password !== conferma_password) {
            return res.status(400).json({
                message:
                    "Le password non coincidono"
            });
        }

        const [utentiEsistenti] =
            await db.execute(
                `SELECT id
                 FROM utenti
                 WHERE email = ?`,
                [emailNormalizzata]
            );

        if (utentiEsistenti.length > 0) {
            return res.status(409).json({
                message:
                    "Esiste già un account con questa email"
            });
        }

        const passwordHash =
            await bcrypt.hash(password, 12);

        const [risultato] =
            await db.execute(
                `INSERT INTO utenti (
            nome,
            cognome,
            email,
            telefono,
            indirizzo_residenza,
            password_hash,
            ruolo,
            funzione,
            puo_gestire_operatori,
            attivo
         )
         VALUES (
            ?, ?, ?, ?, NULL, ?,
            'operatore', ?, FALSE, TRUE
         )`,
                [
                    nomePulito,
                    cognomePulito,
                    emailNormalizzata,
                    telefonoPulito,
                    passwordHash,
                    funzionePulita
                ]
            );
        return res.status(201).json({
            message:
                "Operatore creato correttamente",

            operatore: {
                id: risultato.insertId,
                nome: nomePulito,
                cognome: cognomePulito,
                email: emailNormalizzata,
                telefono: telefonoPulito,
                funzione: funzionePulita,
                ruolo: "operatore",
                puo_gestire_operatori: false
            }
        });
    } catch (error) {
        console.error(
            "Errore creazione operatore:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function updateOperator(req, res) {
    try {
        const operatorId =
            Number(req.params.id);

        const {
            nome,
            cognome,
            email,
            telefono,
            funzione
        } = req.body;

        if (
            !Number.isInteger(operatorId) ||
            operatorId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo dell’operatore non valido"
            });
        }

        if (
            !nome ||
            !cognome ||
            !email ||
            !telefono ||
            !funzione
        ) {
            return res.status(400).json({
                message:
                    "Tutti i campi sono obbligatori"
            });
        }

        const nomePulito =
            nome.trim();

        const cognomePulito =
            cognome.trim();

        const emailNormalizzata =
            email.trim().toLowerCase();

        const telefonoPulito =
            telefono.trim();

        const funzionePulita =
            funzione.trim();

        if (
            nomePulito.length < 2 ||
            cognomePulito.length < 2
        ) {
            return res.status(400).json({
                message:
                    "Nome e cognome non validi"
            });
        }

        if (telefonoPulito.length < 7) {
            return res.status(400).json({
                message:
                    "Numero di telefono non valido"
            });
        }

        if (
            funzionePulita.length < 2 ||
            funzionePulita.length > 100
        ) {
            return res.status(400).json({
                message:
                    "Funzione aziendale non valida"
            });
        }

        const [operatori] =
            await db.execute(
                `SELECT id
                 FROM utenti
                 WHERE id = ?
                   AND ruolo = 'operatore'`,
                [operatorId]
            );

        if (operatori.length === 0) {
            return res.status(404).json({
                message:
                    "Operatore non trovato"
            });
        }

        const [emailEsistenti] =
            await db.execute(
                `SELECT id
                 FROM utenti
                 WHERE email = ?
                   AND id <> ?`,
                [
                    emailNormalizzata,
                    operatorId
                ]
            );

        if (emailEsistenti.length > 0) {
            return res.status(409).json({
                message:
                    "Esiste già un account con questa email"
            });
        }

        await db.execute(
            `UPDATE utenti
             SET nome = ?,
                 cognome = ?,
                 email = ?,
                 telefono = ?,
                 funzione = ?
             WHERE id = ?
               AND ruolo = 'operatore'`,
            [
                nomePulito,
                cognomePulito,
                emailNormalizzata,
                telefonoPulito,
                funzionePulita,
                operatorId
            ]
        );

        return res.status(200).json({
            message:
                "Dati dell’operatore aggiornati correttamente"
        });
    } catch (error) {
        console.error(
            "Errore aggiornamento operatore:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function updateOperatorStatus(req, res) {
    try {
        const operatorId =
            Number(req.params.id);

        const { attivo } = req.body;

        if (
            !Number.isInteger(operatorId) ||
            operatorId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo dell’operatore non valido"
            });
        }

        if (typeof attivo !== "boolean") {
            return res.status(400).json({
                message:
                    "Stato dell’operatore non valido"
            });
        }

        const [operatori] =
            await db.execute(
                `SELECT
                    id,
                    nome,
                    cognome,
                    puo_gestire_operatori,
                    attivo
                 FROM utenti
                 WHERE id = ?
                   AND ruolo = 'operatore'`,
                [operatorId]
            );

        if (operatori.length === 0) {
            return res.status(404).json({
                message:
                    "Operatore non trovato"
            });
        }

        const operatore =
            operatori[0];

        if (
            operatorId ===
            Number(req.session.utente.id)
        ) {
            return res.status(400).json({
                message:
                    "Non puoi disattivare il tuo account"
            });
        }

        if (
            operatore.puo_gestire_operatori &&
            !attivo
        ) {
            return res.status(400).json({
                message:
                    "L’operatore principale non può essere disattivato"
            });
        }

        if (!attivo) {
            const [ticketAttivi] =
                await db.execute(
                    `SELECT COUNT(*) AS totale
                     FROM ticket
                     WHERE operatore_id = ?
                       AND stato <> 'chiuso'`,
                    [operatorId]
                );

            if (
                Number(ticketAttivi[0].totale) > 0
            ) {
                return res.status(409).json({
                    message:
                        "Prima di disattivare l’operatore, " +
                        "riassegna i suoi ticket attivi"
                });
            }
        }

        await db.execute(
            `UPDATE utenti
             SET attivo = ?
             WHERE id = ?
               AND ruolo = 'operatore'`,
            [
                attivo ? 1 : 0,
                operatorId
            ]
        );

        return res.status(200).json({
            message: attivo
                ? "Operatore riattivato correttamente"
                : "Operatore disattivato correttamente"
        });
    } catch (error) {
        console.error(
            "Errore modifica stato operatore:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    getOperators,
    getClients,
    createOperator,
    updateOperator,
    updateOperatorStatus
};