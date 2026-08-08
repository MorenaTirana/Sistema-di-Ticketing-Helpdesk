const express = require("express");

const ticketController = require("../controllers/ticketController");
const commentController = require("../controllers/commentController");
const historyController = require("../controllers/historyController");

const { 
    requireAuth,
    requireOperator
 } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, ticketController.getTickets);

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

router.get(
    "/:id/history",
    requireAuth,
    historyController.getTicketHistory
);

router.get(
    "/:id",
    requireAuth,
    ticketController.getTicketById
);

router.post(
    "/",
    requireAuth,
    ticketController.createTicket
);

module.exports = router;
