const express = require("express");

const documentController = require("../controllers/documentController");

const uploadDocument = require("../middleware/uploadDocumentMiddleware");

const {
    requireAuth,
    requireOperator
} = require("../middleware/authMiddleware");

const router = express.Router();

function gestisciUploadDocumento(req, res, next) {
    uploadDocument.single("documento")(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message:
                    "Il PDF supera la dimensione massima di 10 MB"
            });
        }

        return res.status(400).json({
            message:
                error.message ||
                "Errore durante il caricamento del documento"
        });
    });
}

router.get(
    "/ticket/:ticketId",
    requireAuth,
    documentController.getDocumentsByTicket
);

router.get(
    "/:id/view",
    requireAuth,
    documentController.viewDocument
);

router.get(
    "/:id/download",
    requireAuth,
    documentController.downloadDocument
);

router.post(
    "/",
    requireOperator,
    gestisciUploadDocumento,
    documentController.uploadDocument
);

module.exports = router;