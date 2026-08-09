const fs = require("fs/promises");

async function removeUploadedFile(filePath) {
    if (!filePath) {
        return;
    }

    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error(
            "Impossibile eliminare il file non valido:",
            error.message
        );
    }
}

async function validatePdf(req, res, next) {
    if (!req.file) {
        return res.status(400).json({
            message: "Seleziona un documento PDF"
        });
    }

    let fileHandle;

    try {
        fileHandle = await fs.open(req.file.path, "r");

        const intestazione = Buffer.alloc(5);

        await fileHandle.read(
            intestazione,
            0,
            intestazione.length,
            0
        );

        const firma = intestazione.toString("ascii");

        if (firma !== "%PDF-") {
            await fileHandle.close();
            fileHandle = null;

            await removeUploadedFile(req.file.path);

            return res.status(400).json({
                message:
                    "Il file caricato non contiene un documento PDF valido"
            });
        }

        await fileHandle.close();
        fileHandle = null;

        next();
    } catch (error) {
        if (fileHandle) {
            await fileHandle.close();
        }

        await removeUploadedFile(req.file?.path);

        console.error(
            "Errore durante la verifica del PDF:",
            error
        );

        return res.status(500).json({
            message: "Impossibile verificare il documento"
        });
    }
}

module.exports = validatePdf;