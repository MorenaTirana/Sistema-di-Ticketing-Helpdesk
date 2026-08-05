const express = require("express");

const ticketController = require("../controllers/ticketController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, ticketController.getTickets);
router.post("/", requireAuth, ticketController.createTicket);

module.exports = router;