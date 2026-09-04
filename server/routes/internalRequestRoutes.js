const express = require("express");
const fs = require("fs");

const internalRequestController =
    require(
        "../controllers/internalRequestController"
    );

const {
    requireAuth,
    requireOperator,
    requireOperatorManager
} = require("../middleware/authMiddleware");

const uploadTicketAttachments =
    require(
        "../middleware/uploadTicketAttachmentsMiddleware"
    );

const router = express.Router();

function uploadSingleFile(req, res, next) {
    uploadTicketAttachments.single(
        "allegato"
    )(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        if (req.file) {
            fs.unlink(
                req.file.path,
                () => {}
            );
        }

        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message:
                    "Il file supera la dimensione massima di 100 MB"
            });
        }

        return res.status(400).json({
            message:
                error.message ||
                "Errore durante il caricamento"
        });
    });
}

router.post(
    "/",
    requireOperator,
    internalRequestController.createInternalRequest
);

router.get(
    "/ticket/:ticketId",
    requireOperator,
    internalRequestController.getTicketInternalRequests
);

router.post(
    "/:id/replies",
    requireOperator,
    uploadSingleFile,
    internalRequestController.createInternalReply
);

router.get(
    "/replies/:replyId/file",
    requireAuth,
    internalRequestController.viewInternalReplyFile
);

router.patch(
    "/replies/:replyId/share",
    requireOperatorManager,
    internalRequestController.shareInternalReplyWithClient
);

router.patch(
    "/:id/complete",
    requireOperator,
    internalRequestController.completeInternalRequest
);

module.exports = router;