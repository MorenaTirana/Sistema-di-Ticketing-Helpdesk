const express = require("express");

const ricController =
    require("../controllers/ricController");

const uploadRic =
    require("../middleware/uploadRicMiddleware");

const {
    requireOperator
} = require("../middleware/authMiddleware");

const router = express.Router();

function gestisciUploadRic(req, res, next) {
    uploadRic.single("documento")(req, res, (error) => {
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
                "Errore durante il caricamento del PDF"
        });
    });
}

router.get(
    "/ticket/:ticketId",
    requireOperator,
    ricController.getRicsByTicket
);

router.get(
    "/:id/view",
    requireOperator,
    ricController.viewRic
);

router.get(
    "/:id/download",
    requireOperator,
    ricController.downloadRic
);

router.post(
    "/",
    requireOperator,
    gestisciUploadRic,
    ricController.createRic
);

module.exports = router;