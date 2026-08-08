const db = require("../db");


async function createBoat(req, res) {
    try {
        const utente = req.session.utente;

        const {
            modello,
            matricola,
            anno_produzione,
            localizzazione,
            indirizzo_consegna,
            garanzia_attivata_il
        } = req.body;

        // Per ora soltanto il cliente registra le proprie barche
        if (utente.ruolo !== "utente") {
            return res.status(403).json({
                message:
                    "Solo un cliente può registrare una propria barca"
            });
        }

        if (
            !modello ||
            !matricola ||
            !anno_produzione ||
            !localizzazione ||
            !indirizzo_consegna
        ) {
            return res.status(400).json({
                message:
                    "Compila tutti i dati obbligatori della barca"
            });
        }

        const modelloPulito = modello.trim();
        const matricolaPulita =
            matricola.trim().toUpperCase();

        const localizzazionePulita =
            localizzazione.trim();

        const indirizzoPulito =
            indirizzo_consegna.trim();

        const anno = Number(anno_produzione);
        const annoCorrente = new Date().getFullYear();

        if (
            !Number.isInteger(anno) ||
            anno < 1950 ||
            anno > annoCorrente
        ) {
            return res.status(400).json({
                message: "Anno di produzione non valido"
            });
        }

        if (modelloPulito.length < 3) {
            return res.status(400).json({
                message:
                    "Il modello deve contenere almeno 3 caratteri"
            });
        }

        if (matricolaPulita.length < 5) {
            return res.status(400).json({
                message:
                    "La matricola deve contenere almeno 5 caratteri"
            });
        }

        const dataGaranzia =
            garanzia_attivata_il || null;

        const [risultato] = await db.execute(
            `INSERT INTO barche (
                utente_id,
                modello,
                matricola,
                anno_produzione,
                localizzazione,
                indirizzo_consegna,
                garanzia_attivata_il,
                garanzia_scadenza_il
             )
             VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                CASE
                    WHEN ? IS NULL THEN NULL
                    ELSE DATE_ADD(?, INTERVAL 24 MONTH)
                END
             )`,
            [
                utente.id,
                modelloPulito,
                matricolaPulita,
                anno,
                localizzazionePulita,
                indirizzoPulito,
                dataGaranzia,
                dataGaranzia,
                dataGaranzia
            ]
        );

        return res.status(201).json({
            message: "Barca registrata correttamente",
            barca: {
                id: risultato.insertId,
                modello: modelloPulito,
                matricola: matricolaPulita
            }
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message:
                    "Esiste già una barca con questa matricola"
            });
        }

        console.error(
            "Errore durante la registrazione della barca:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}


async function getBoats(req, res) {
    try {
        const utente = req.session.utente;

        let query = `
            SELECT
                b.id,
                b.modello,
                b.matricola,
                b.anno_produzione,
                b.localizzazione,
                b.indirizzo_consegna,
                b.garanzia_attivata_il,
                b.garanzia_scadenza_il,
                b.created_at,
                u.id AS utente_id,
                u.nome AS utente_nome,
                u.cognome AS utente_cognome,
                u.email AS utente_email
            FROM barche AS b
            INNER JOIN utenti AS u
                ON b.utente_id = u.id
        `;

        const parametri = [];

        // Il cliente vede soltanto le proprie barche
        if (utente.ruolo === "utente") {
            query += `
                WHERE b.utente_id = ?
            `;

            parametri.push(utente.id);
        }

        // L'operatore vede tutte le barche
        query += `
            ORDER BY b.created_at DESC
        `;

        const [barche] = await db.execute(
            query,
            parametri
        );

        return res.status(200).json({
            barche
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero delle barche:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}


module.exports = {
    createBoat,
    getBoats
};