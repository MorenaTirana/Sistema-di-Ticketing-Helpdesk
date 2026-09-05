const db = require("../db");


async function createBoat(req, res) {
    try {
        const utenteCollegato = req.session.utente;

       const {
    cliente_id,
    modello,
    matricola,
    anno_produzione,
    localizzazione,
    garanzia_attivata_il
} = req.body;

        if (
            utenteCollegato.ruolo !== "utente" &&
            utenteCollegato.ruolo !== "operatore"
        ) {
            return res.status(403).json({
                message:
                    "Non sei autorizzato a registrare una barca"
            });
        }

        let clienteId;

        if (utenteCollegato.ruolo === "utente") {
            clienteId = utenteCollegato.id;
        } else {
            clienteId = Number(cliente_id);

            if (
                !Number.isInteger(clienteId) ||
                clienteId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Seleziona il cliente proprietario della barca"
                });
            }

            const [clienti] = await db.execute(
                `SELECT id
                 FROM utenti
                 WHERE id = ?
                   AND ruolo = 'utente'`,
                [clienteId]
            );

            if (clienti.length === 0) {
                return res.status(400).json({
                    message: "Cliente non valido"
                });
            }
        }

       if (
    !modello ||
    !matricola ||
    !anno_produzione ||
    !localizzazione
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
        garanzia_attivata_il,
        garanzia_scadenza_il
     )
     VALUES (
        ?, ?, ?, ?, ?, ?,
        CASE
            WHEN ? IS NULL THEN NULL
            ELSE DATE_ADD(?, INTERVAL 24 MONTH)
        END
     )`,
    [
        clienteId,
        modelloPulito,
        matricolaPulita,
        anno,
        localizzazionePulita,
        dataGaranzia,
        dataGaranzia,
        dataGaranzia
    ]
);

        return res.status(201).json({
            message: "Barca registrata correttamente",

            barca: {
                id: risultato.insertId,
                utente_id: clienteId,
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

        if (
            utente.ruolo !== "utente" &&
            utente.ruolo !== "operatore"
        ) {
            return res.status(403).json({
                message:
                    "Non sei autorizzato a consultare le barche"
            });
        }

        let query = `
            SELECT
                b.id,
                b.modello,
                b.matricola,
                b.anno_produzione,
                b.localizzazione,
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

        if (utente.ruolo === "utente") {
            /*
             * Il cliente vede sempre e solamente
             * le proprie barche.
             */
            query += `
                WHERE b.utente_id = ?
            `;

            parametri.push(utente.id);
        }

        if (
            utente.ruolo === "operatore" &&
            req.query.cliente_id !== undefined
        ) {
            const clienteId =
                Number(req.query.cliente_id);

            if (
                !Number.isInteger(clienteId) ||
                clienteId <= 0
            ) {
                return res.status(400).json({
                    message: "Cliente non valido"
                });
            }

            query += `
                WHERE b.utente_id = ?
            `;

            parametri.push(clienteId);
        }

        query += `
            ORDER BY
                u.cognome ASC,
                u.nome ASC,
                b.modello ASC,
                b.matricola ASC
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