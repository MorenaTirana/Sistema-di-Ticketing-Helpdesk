const express = require("express");
const fs = require("fs");

const ticketController =
    require("../controllers/ticketController");
const commentController =
    require("../controllers/commentController");
const historyController =
    require("../controllers/historyController");
const attachmentController =
    require("../controllers/attachmentController");
const consultationController =
    require("../controllers/consultationController");

const {
    requireAuth,
    requireOperator,
    requireOperatorOrTechnician
} = require("../middleware/authMiddleware");

const uploadTicketAttachments =
    require("../middleware/uploadTicketAttachmentsMiddleware");

const router = express.Router();


function eliminaFileCaricati(files = []) {
    files.forEach((file) => {
        fs.unlink(file.path, () => { });
    });
}


function gestisciUploadAllegati(req, res, next) {
    uploadTicketAttachments.array(
        "allegati",
        8
    )(req, res, (error) => {
        if (!error) {
            res.on("finish", () => {
                if (res.statusCode >= 400) {
                    eliminaFileCaricati(req.files);
                }
            });

            next();
            return;
        }

        eliminaFileCaricati(req.files);

        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message:
                    "Uno degli allegati supera la dimensione massima di 100 MB"
            });
        }

        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                message:
                    "Puoi caricare al massimo 8 allegati"
            });
        }

        return res.status(400).json({
            message:
                error.message ||
                "Errore durante il caricamento degli allegati"
        });
    });
}


/*
 * Elenco dei ticket.
 */
router.get(
    "/",
    requireAuth,
    ticketController.getTickets
);


/*
 * Consultazioni ricevute dal tecnico collegato.
 */
router.get(
    "/consultations/mine",
    requireOperatorOrTechnician,
    consultationController.getMyConsultations
);


/*
 * Gestione del ticket.
 */
router.patch(
    "/:id/status",
    requireOperator,
    ticketController.updateTicketStatus
);

router.patch(
    "/:id/management",
    requireOperator,
    ticketController.updateTicketManagement
);

router.patch(
    "/:id/assignment",
    requireOperator,
    ticketController.assignTicket
);

router.patch(
    "/:id/boat",
    requireAuth,
    ticketController.updateTicketBoat
);


/*
 * Consultazioni.
 */
router.get(
    "/:id/consultations",
    requireOperatorOrTechnician,
    consultationController.getConsultations
);

router.post(
    "/:id/consultations",
    requireOperator,
    consultationController.createConsultation
);

router.patch(
    "/:id/consultations/:consultationId",
    requireOperator,
    consultationController.updateConsultation
);

router.delete(
    "/:id/consultations/:consultationId",
    requireOperator,
    consultationController.deleteConsultation
);

router.patch(
    "/:id/consultations/:consultationId/response",
    requireOperatorOrTechnician,
    gestisciUploadAllegati,
    consultationController.respondConsultation
);

router.delete(
    "/:id/consultations/:consultationId/response",
    requireOperatorOrTechnician,
    consultationController.deleteConsultationResponse
);

router.get(
    "/consultation-attachments/:attachmentId/view",
    requireOperatorOrTechnician,
    consultationController.viewConsultationAttachment
);


router.delete(
    "/consultation-attachments/:attachmentId",
    requireOperatorOrTechnician,
    consultationController.deleteConsultationAttachment
);
router.post(
    "/:id/consultations/:consultationId/responses",
    requireOperatorOrTechnician,
    gestisciUploadAllegati,
    consultationController
        .createAdditionalConsultationResponse
);

router.patch(
    "/:id/consultations/:consultationId/responses/:responseId",
    requireOperatorOrTechnician,
    consultationController
        .updateAdditionalConsultationResponse
);

router.delete(
    "/:id/consultations/:consultationId/responses/:responseId",
    requireOperatorOrTechnician,
    consultationController
        .deleteAdditionalConsultationResponse
);

/*
 * Allegati generali del ticket.
 */
router.post(
    "/:id/attachments",
    requireAuth,
    gestisciUploadAllegati,
    attachmentController.uploadAttachments
);

router.get(
    "/:id/attachments",
    requireAuth,
    attachmentController.getAttachments
);

router.get(
    "/attachments/:attachmentId/view",
    requireAuth,
    attachmentController.viewAttachment
);

router.delete(
    "/attachments/:attachmentId",
    requireAuth,
    attachmentController.deleteAttachment
);


/*
 * Commenti.
 */
router.get(
    "/:id/comments",
    requireAuth,
    commentController.getComments
);

router.post(
    "/:id/comments",
    requireAuth,
    commentController.createComment
);

router.patch(
    "/:id/comments/:commentId",
    requireAuth,
    commentController.updateComment
);

router.delete(
    "/:id/comments/:commentId",
    requireAuth,
    commentController.deleteComment
);


/*
 * Storico.
 */
router.get(
    "/:id/history",
    requireAuth,
    historyController.getTicketHistory
);


/*
 * Dettaglio del ticket.
 * Deve rimanere dopo le rotte specifiche.
 */
router.get(
    "/:id",
    requireAuth,
    ticketController.getTicketById
);


/*
 * Creazione del ticket.
 */
router.post(
    "/",
    requireAuth,
    gestisciUploadAllegati,
    ticketController.createTicket
);
module.exports = router;