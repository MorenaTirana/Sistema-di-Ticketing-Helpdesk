const express = require("express");

const ticketController = require("../controllers/ticketController");
const commentController = require("../controllers/commentController");

const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, ticketController.getTickets);

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