const express = require("express");

const {
    getNotifications,
    markNotificationAsRead
} = require("../controllers/notificationController");

const {
    requireAuth
} = require("../middleware/authMiddleware");

const router = express.Router();

// Elenco delle notifiche dell'utente collegato
router.get(
    "/",
    requireAuth,
    getNotifications
);

// Segna una notifica come letta
router.patch(
    "/:id/read",
    requireAuth,
    markNotificationAsRead
);

module.exports = router;