const db = require("../db");
const fs = require("fs");
const path = require("path");

function eliminaFile(file) {
    if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
}

async function createRic(req, res) {
    try {
        const {
            ticket_id,
            numero_ric,
            causale,
            destinatario,
            riferimento,
            data_ric,
            note
        } = req.body;

        const causaliConsentite = [
            "garanzia",
            "trasferta",
            "ricambio",
            "altro"
        ];

        if (!req.file) {
            return res.status(400).json({
                message: "Seleziona il PDF del RIC"
            });
        }

        if (
            !ticket_id ||
            !numero_ric ||
            !causale ||
            !destinatario ||
            !riferimento ||
            !data_ric
        ) {
            eliminaFile(req.file);

            return res.status(400).json({
                message: "Compila tutti i dati obbligatori"
            });
        }

        if (!causaliConsentite.includes(causale)) {
            eliminaFile(req.file);

            return res.status(400).json({
                message: "Causale del RIC non valida"
            });
        }

        // Verifica il contenuto iniziale del file.
        const fileDescriptor = fs.openSync(req.file.path, "r");
        const intestazione = Buffer.alloc(5);

        fs.readSync(
            fileDescriptor,
            intestazione,
            0,
            5,
            0
        );

        fs.closeSync(fileDescriptor);

        if (intestazione.toString() !== "%PDF-") {
            eliminaFile(req.file);

            return res.status(400).json({
                message: "Il file caricato non è un PDF valido"
            });
        }

        // Recupera la barca direttamente dal ticket.
        const [ticketTrovati] = await db.execute(
            `SELECT id, barca_id
             FROM ticket
             WHERE id = ?`,
            [ticket_id]
        );

        if (ticketTrovati.length === 0) {
            eliminaFile(req.file);

            return res.status(404).json({
                message: "Ticket non trovato"
            });
        }

        const barcaId = ticketTrovati[0].barca_id;

        if (!barcaId) {
            eliminaFile(req.file);

            return res.status(400).json({
                message: "Il ticket non è collegato a una barca"
            });
        }

        const [risultato] = await db.execute(
            `INSERT INTO ric (
                ticket_id,
                barca_id,
                numero_ric,
                causale,
                destinatario,
                riferimento,
                data_ric,
                note,
                nome_file_originale,
                nome_file_salvato,
                mime_type,
                dimensione_file,
                caricato_da
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ticket_id,
                barcaId,
                numero_ric.trim(),
                causale,
                destinatario.trim(),
                riferimento.trim(),
                data_ric,
                note?.trim() || null,
                req.file.originalname,
                req.file.filename,
                req.file.mimetype,
                req.file.size,
                req.session.utente.id
            ]
        );

        return res.status(201).json({
            message: "RIC caricato correttamente",
            ric: {
                id: risultato.insertId,
                numero_ric: numero_ric.trim(),
                nome_file: req.file.originalname
            }
        });
    } catch (error) {
        eliminaFile(req.file);

        console.error(
            "Errore durante il caricamento del RIC:",
            error
        );

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Esiste già un RIC con questo numero"
            });
        }

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function getRicsByTicket(req, res) {
    try {
        const ticketId = Number(req.params.ticketId);

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message: "Identificativo del ticket non valido"
            });
        }

        const [rics] = await db.execute(
            `SELECT
                r.id,
                r.numero_ric,
                r.causale,
                r.destinatario,
                r.riferimento,
                r.data_ric,
                r.note,
                r.nome_file_originale,
                r.dimensione_file,
                r.created_at,
                u.nome AS operatore_nome,
                u.cognome AS operatore_cognome
             FROM ric AS r
             LEFT JOIN utenti AS u
                ON r.caricato_da = u.id
             WHERE r.ticket_id = ?
               AND r.nome_file_salvato IS NOT NULL
             ORDER BY r.data_ric DESC, r.id DESC`,
            [ticketId]
        );

        return res.status(200).json({
            rics
        });
    } catch (error) {
        console.error(
            "Errore durante il recupero dei RIC:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function trovaFileRic(ricId) {
    const [risultati] = await db.execute(
        `SELECT
            id,
            nome_file_originale,
            nome_file_salvato,
            mime_type
         FROM ric
         WHERE id = ?`,
        [ricId]
    );

    if (risultati.length === 0) {
        return null;
    }

    return risultati[0];
}

async function viewRic(req, res) {
    try {
        const ricId = Number(req.params.id);

        if (!Number.isInteger(ricId) || ricId <= 0) {
            return res.status(400).json({
                message: "Identificativo del RIC non valido"
            });
        }

        const ric = await trovaFileRic(ricId);

        if (!ric || !ric.nome_file_salvato) {
            return res.status(404).json({
                message: "Documento RIC non trovato"
            });
        }

        const percorsoFile = path.join(
            __dirname,
            "../uploads/ric",
            path.basename(ric.nome_file_salvato)
        );

        if (!fs.existsSync(percorsoFile)) {
            return res.status(404).json({
                message: "Il PDF del RIC non è disponibile"
            });
        }

        res.setHeader("Content-Type", "application/pdf");

        res.setHeader(
            "Content-Disposition",
            `inline; filename*=UTF-8''${
                encodeURIComponent(ric.nome_file_originale)
            }`
        );

        return res.sendFile(percorsoFile);
    } catch (error) {
        console.error(
            "Errore durante la visualizzazione del RIC:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function downloadRic(req, res) {
    try {
        const ricId = Number(req.params.id);

        if (!Number.isInteger(ricId) || ricId <= 0) {
            return res.status(400).json({
                message: "Identificativo del RIC non valido"
            });
        }

        const ric = await trovaFileRic(ricId);

        if (!ric || !ric.nome_file_salvato) {
            return res.status(404).json({
                message: "Documento RIC non trovato"
            });
        }

        const percorsoFile = path.join(
            __dirname,
            "../uploads/ric",
            path.basename(ric.nome_file_salvato)
        );

        if (!fs.existsSync(percorsoFile)) {
            return res.status(404).json({
                message: "Il PDF del RIC non è disponibile"
            });
        }

        return res.download(
            percorsoFile,
            ric.nome_file_originale
        );
    } catch (error) {
        console.error(
            "Errore durante il download del RIC:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    createRic,
    getRicsByTicket,
    viewRic,
    downloadRic
};