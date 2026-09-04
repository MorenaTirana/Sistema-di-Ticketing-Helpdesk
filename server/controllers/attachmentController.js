const path = require("path");
const fs = require("fs");
const db = require("../db");


async function checkTicketAccess(
    ticketId,
    utente
) {
    if (
        !Number.isInteger(ticketId) ||
        ticketId <= 0
    ) {
        return {
            allowed: false,
            status: 400,
            message:
                "Identificativo del ticket non valido"
        };
    }

    const [ticket] = await db.execute(
        `SELECT
            id,
            utente_id
         FROM ticket
         WHERE id = ?`,
        [ticketId]
    );

    if (ticket.length === 0) {
        return {
            allowed: false,
            status: 404,
            message: "Ticket non trovato"
        };
    }

    if (
        utente.ruolo === "utente" &&
        Number(ticket[0].utente_id) !==
        Number(utente.id)
    ) {
        return {
            allowed: false,
            status: 403,
            message:
                "Non puoi accedere a questo ticket"
        };
    }

    return {
        allowed: true,
        ticket: ticket[0]
    };
}


async function getAttachments(req, res) {
    try {
        const ticketId =
            Number(req.params.id);

        const utente =
            req.session.utente;

        const accesso =
            await checkTicketAccess(
                ticketId,
                utente
            );

        if (!accesso.allowed) {
            return res
                .status(accesso.status)
                .json({
                    message: accesso.message
                });
        }

        const [allegati] = await db.execute(
            `SELECT
                a.id,
                a.ticket_id,
                a.tipo,
                a.descrizione,
                a.nome_file_originale,
                a.nome_file_salvato,
                a.mime_type,
                a.dimensione_file,
                a.caricato_da,
                a.visibile_cliente,
                a.created_at,
                autore.nome AS autore_nome,
                autore.cognome AS autore_cognome,
                autore.ruolo AS autore_ruolo
             FROM ticket_allegati AS a
             INNER JOIN utenti AS autore
                ON a.caricato_da = autore.id
             WHERE a.ticket_id = ?
               AND (
                    ? = 'operatore'
                    OR a.visibile_cliente = 1
               )
             ORDER BY
                a.created_at ASC,
                a.id ASC`,
            [
                ticketId,
                utente.ruolo
            ]
        );

        const allegatiConPermessi =
            allegati.map((allegato) => ({
                ...allegato,

                origine:
                    allegato.autore_ruolo ===
                        "operatore"
                        ? "Operatore"
                        : "Cliente",

                eliminabile:
                    utente.ruolo ===
                    "operatore" ||
                    Number(
                        allegato.caricato_da
                    ) === Number(utente.id)
            }));

        return res.status(200).json({
            allegati:
                allegatiConPermessi
        });
    } catch (error) {
        console.error(
            "Errore recupero allegati:",
            error
        );

        return res.status(500).json({
            message:
                "Errore interno del server"
        });
    }
}


async function viewAttachment(req, res) {
    try {
        const attachmentId =
            Number(req.params.attachmentId);

        if (
            !Number.isInteger(attachmentId) ||
            attachmentId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo dell’allegato non valido"
            });
        }

        const [risultati] =
            await db.execute(
                `SELECT
                    a.nome_file_salvato,
                    a.nome_file_originale,
                    a.mime_type,
                    a.visibile_cliente,
                    t.utente_id
                 FROM ticket_allegati AS a
                 INNER JOIN ticket AS t
                    ON a.ticket_id = t.id
                 WHERE a.id = ?`,
                [attachmentId]
            );

        if (risultati.length === 0) {
            return res.status(404).json({
                message:
                    "Allegato non trovato"
            });
        }

        const allegato =
            risultati[0];

        const utente =
            req.session.utente;

        if (
            utente.ruolo === "utente" &&
            (
                Number(allegato.utente_id) !==
                Number(utente.id) ||
                !allegato.visibile_cliente
            )
        ) {
            return res.status(403).json({
                message:
                    "Non puoi visualizzare questo allegato"
            });
        }

        const nomeSicuro =
            path.basename(
                allegato.nome_file_salvato
            );

        const percorso =
            path.join(
                __dirname,
                "../uploads/ticket-allegati",
                nomeSicuro
            );

        if (!fs.existsSync(percorso)) {
            return res.status(404).json({
                message:
                    "Il file dell’allegato non è stato trovato"
            });
        }

        res.type(allegato.mime_type);

        return res.sendFile(percorso);
    } catch (error) {
        console.error(
            "Errore visualizzazione allegato:",
            error
        );

        return res.status(500).json({
            message:
                "Errore interno del server"
        });
    }
}

const documentiConsentiti = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/rtf",
    "text/rtf",
    "application/zip",
    "application/x-zip-compressed"
]);

async function uploadAttachments(req, res) {
    try {
        const ticketId =
            Number(req.params.id);

        const utente =
            req.session.utente;

        const allegati =
            Array.isArray(req.files)
                ? req.files
                : [];

        const accesso =
            await checkTicketAccess(
                ticketId,
                utente
            );

        if (!accesso.allowed) {
            return res
                .status(accesso.status)
                .json({
                    message:
                        accesso.message
                });
        }

        if (allegati.length === 0) {
            return res.status(400).json({
                message:
                    "Seleziona almeno una foto, un video o un documento PDF"
            });
        }

        const allegatiNonValidi = allegati.filter(
            (file) =>
                !file.mimetype.startsWith("image/") &&
                !file.mimetype.startsWith("video/") &&
                !documentiConsentiti.has(file.mimetype)
        );

        if (allegatiNonValidi.length > 0) {
            return res.status(400).json({
                message: "Uno o più file hanno un formato non consentito."
            });
        }

        const categoriaAllegato =
    req.body.categoria_allegato;

for (const file of allegati) {
    let tipo = "documento";

    if (
        categoriaAllegato !==
        "documento_cliente"
    ) {
        if (file.mimetype.startsWith("image/")) {
            tipo = "foto";
        } else if (
            file.mimetype.startsWith("video/")
        ) {
            tipo = "video";
        }
    }

            await db.execute(
                `INSERT INTO ticket_allegati (
                    ticket_id,
                    ticket_voce_id,
                    tipo,
                    descrizione,
                    nome_file_originale,
                    nome_file_salvato,
                    mime_type,
                    dimensione_file,
                    durata_secondi,
                    nome_anteprima,
                    caricato_da,
                    visibile_cliente,
                    consenso_analisi_ai
                 )
                 VALUES (
                    ?,
                    NULL,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    NULL,
                    NULL,
                    ?,
                    1,
                    0
                 )`,
                [
                    ticketId,
                    tipo,
                    "Allegato aggiunto alla conversazione",
                    file.originalname,
                    file.filename,
                    file.mimetype,
                    file.size,
                    utente.id
                ]
            );
        }

        return res.status(201).json({
            message:
                "Allegati caricati correttamente"
        });
    } catch (error) {
        console.error(
            "Errore durante il caricamento degli allegati:",
            error
        );

        return res.status(500).json({
            message:
                "Errore interno del server"
        });
    }
}


async function deleteAttachment(req, res) {
    try {
        const attachmentId =
            Number(req.params.attachmentId);

        const utente =
            req.session.utente;

        if (
            !Number.isInteger(attachmentId) ||
            attachmentId <= 0
        ) {
            return res.status(400).json({
                message:
                    "Identificativo dell’allegato non valido"
            });
        }

        const [risultati] =
            await db.execute(
                `SELECT
                    a.id,
                    a.nome_file_salvato,
                    a.caricato_da,
                    t.utente_id
                 FROM ticket_allegati AS a
                 INNER JOIN ticket AS t
                    ON a.ticket_id = t.id
                 WHERE a.id = ?`,
                [attachmentId]
            );

        if (risultati.length === 0) {
            return res.status(404).json({
                message:
                    "Allegato non trovato"
            });
        }

        const allegato =
            risultati[0];

        const clienteProprietario =
            utente.ruolo === "utente" &&
            Number(allegato.utente_id) ===
            Number(utente.id) &&
            Number(allegato.caricato_da) ===
            Number(utente.id);

        const operatore =
            utente.ruolo === "operatore";

        if (
            !clienteProprietario &&
            !operatore
        ) {
            return res.status(403).json({
                message:
                    "Non puoi eliminare questo allegato"
            });
        }

        await db.execute(
            `DELETE FROM ticket_allegati
             WHERE id = ?`,
            [attachmentId]
        );

        const nomeSicuro =
            path.basename(
                allegato.nome_file_salvato
            );

        const percorso =
            path.join(
                __dirname,
                "../uploads/ticket-allegati",
                nomeSicuro
            );

        fs.unlink(
            percorso,
            (error) => {
                if (
                    error &&
                    error.code !== "ENOENT"
                ) {
                    console.error(
                        "Errore eliminazione file:",
                        error
                    );
                }
            }
        );

        return res.status(200).json({
            message:
                "Allegato eliminato correttamente"
        });
    } catch (error) {
        console.error(
            "Errore eliminazione allegato:",
            error
        );

        return res.status(500).json({
            message:
                "Errore interno del server"
        });
    }
}


module.exports = {
    getAttachments,
    viewAttachment,
    uploadAttachments,
    deleteAttachment
};