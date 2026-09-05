const db = require("../db");
const fs = require("fs");
const path = require("path");

function eliminaFile(file) {
    if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
}

async function uploadDocument(req, res) {
    try {
        const {
            ticket_id,
            ric_id,
            tipo,
            numero_documento,
            serie_documento,
            data_documento,
            note
        } = req.body;

        const tipiConsentiti = [
            "preventivo",
            "proforma",
            "ordine_fornitore",
            "ddt_fornitore",
            "ddt_cliente",
            "documento_corriere",
            "conferma_pagamento",
            "altro"
        ];

        const tipiVisibiliCliente = [
            "preventivo",
            "proforma",
            "ddt_cliente",
            "documento_corriere",
            "conferma_pagamento"
        ];

        if (!req.file) {
            return res.status(400).json({
                message: "Seleziona il documento PDF"
            });
        }

        if (!ticket_id || !tipo) {
            eliminaFile(req.file);

            return res.status(400).json({
                message: "Ticket e tipo di documento sono obbligatori"
            });
        }

        if (!tipiConsentiti.includes(tipo)) {
            eliminaFile(req.file);

            return res.status(400).json({
                message: "Tipo di documento non valido"
            });
        }

        // Controlla che il contenuto sia realmente un PDF.
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

        const [ticketTrovati] = await db.execute(
            `SELECT id
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

        let ricId = null;

        if (ric_id) {
            const [ricTrovati] = await db.execute(
                `SELECT id
                 FROM ric
                 WHERE id = ?
                   AND ticket_id = ?`,
                [ric_id, ticket_id]
            );

            if (ricTrovati.length === 0) {
                eliminaFile(req.file);

                return res.status(400).json({
                    message:
                        "Il RIC indicato non appartiene a questo ticket"
                });
            }

            ricId = Number(ric_id);
        }

        const visibileCliente =
            tipiVisibiliCliente.includes(tipo);

        const [risultato] = await db.execute(
            `INSERT INTO documenti_ticket (
                ticket_id,
                ric_id,
                tipo,
                numero_documento,
                serie_documento,
                data_documento,
                note,
                visibile_cliente,
                nome_file_originale,
                nome_file_salvato,
                mime_type,
                dimensione_file,
                caricato_da
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ticket_id,
                ricId,
                tipo,
                numero_documento?.trim() || null,
                serie_documento?.trim() || null,
                data_documento || null,
                note?.trim() || null,
                visibileCliente,
                req.file.originalname,
                req.file.filename,
                req.file.mimetype,
                req.file.size,
                req.session.utente.id
            ]
        );

        return res.status(201).json({
            message: "Documento caricato correttamente",
            documento: {
                id: risultato.insertId,
                tipo,
                visibile_cliente: visibileCliente,
                nome_file: req.file.originalname
            }
        });
    } catch (error) {
        eliminaFile(req.file);

        console.error(
            "Errore durante il caricamento del documento:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function getDocumentsByTicket(req, res) {
    try {
        const ticketId = Number(req.params.ticketId);
        const utente = req.session.utente;

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                message: "Identificativo del ticket non valido"
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

        if (
            utente.ruolo === "utente" &&
            ticketTrovati[0].utente_id !== utente.id
        ) {
            return res.status(403).json({
                message: "Non puoi accedere a questo ticket"
            });
        }

        let query = `
            SELECT
                d.id,
                d.tipo,
                d.numero_documento,
                d.serie_documento,
                d.data_documento,
                d.note,
                d.visibile_cliente,
                d.nome_file_originale,
                d.dimensione_file,
                d.created_at,
                u.nome AS operatore_nome,
                u.cognome AS operatore_cognome
            FROM documenti_ticket AS d
            LEFT JOIN utenti AS u
                ON d.caricato_da = u.id
            WHERE d.ticket_id = ?
        `;

        const parametri = [ticketId];

        if (utente.ruolo === "utente") {
            query += `
                AND d.visibile_cliente = 1
            `;
        }

        query += `
            ORDER BY
    COALESCE(d.created_at, d.data_documento) ASC,
    d.id ASC
        `;

        const [documenti] = await db.execute(
            query,
            parametri
        );

        return res.status(200).json({
            documenti
        });
    } catch (error) {
        console.error(
            "Errore recupero documenti:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function trovaDocumento(documentId) {
    const [risultati] = await db.execute(
        `SELECT
            d.*,
            t.utente_id
         FROM documenti_ticket AS d
         INNER JOIN ticket AS t
            ON d.ticket_id = t.id
         WHERE d.id = ?`,
        [documentId]
    );

    if (risultati.length === 0) {
        return null;
    }

    return risultati[0];
}

function puoAccedereAlDocumento(documento, utente) {
    if (utente.ruolo === "operatore") {
        return true;
    }

    return (
        documento.visibile_cliente === 1 &&
        documento.utente_id === utente.id
    );
}

function trovaPercorsoDocumento(documento) {
    return path.join(
        __dirname,
        "../uploads/documenti",
        path.basename(documento.nome_file_salvato)
    );
}

async function viewDocument(req, res) {
    try {
        const documentId = Number(req.params.id);
        const utente = req.session.utente;

        if (!Number.isInteger(documentId) || documentId <= 0) {
            return res.status(400).json({
                message: "Identificativo del documento non valido"
            });
        }

        const documento =
            await trovaDocumento(documentId);

        if (!documento) {
            return res.status(404).json({
                message: "Documento non trovato"
            });
        }

        if (!puoAccedereAlDocumento(documento, utente)) {
            return res.status(403).json({
                message: "Non puoi visualizzare questo documento"
            });
        }

        const percorso =
            trovaPercorsoDocumento(documento);

        if (!fs.existsSync(percorso)) {
            return res.status(404).json({
                message: "Il PDF non è disponibile"
            });
        }

        res.setHeader("Content-Type", "application/pdf");

        res.setHeader(
            "Content-Disposition",
            `inline; filename*=UTF-8''${
                encodeURIComponent(
                    documento.nome_file_originale
                )
            }`
        );

        return res.sendFile(percorso);
    } catch (error) {
        console.error(
            "Errore visualizzazione documento:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

async function downloadDocument(req, res) {
    try {
        const documentId = Number(req.params.id);
        const utente = req.session.utente;

        if (!Number.isInteger(documentId) || documentId <= 0) {
            return res.status(400).json({
                message: "Identificativo del documento non valido"
            });
        }

        const documento =
            await trovaDocumento(documentId);

        if (!documento) {
            return res.status(404).json({
                message: "Documento non trovato"
            });
        }

        if (!puoAccedereAlDocumento(documento, utente)) {
            return res.status(403).json({
                message: "Non puoi scaricare questo documento"
            });
        }

        const percorso =
            trovaPercorsoDocumento(documento);

        if (!fs.existsSync(percorso)) {
            return res.status(404).json({
                message: "Il PDF non è disponibile"
            });
        }

        return res.download(
            percorso,
            documento.nome_file_originale
        );
    } catch (error) {
        console.error(
            "Errore download documento:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server"
        });
    }
}

module.exports = {
    uploadDocument,
    getDocumentsByTicket,
    viewDocument,
    downloadDocument
};