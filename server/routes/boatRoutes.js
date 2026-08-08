const express = require("express");

const {
    createBoat,
    getBoats
} = require("../controllers/boatController");

const {
    requireAuth
} = require("../middleware/authMiddleware");

const router = express.Router();

// Visualizza le proprie barche.
// L'operatore visualizza tutte le barche.
router.get(
    "/",
    requireAuth,
    getBoats
);

// Registra una nuova barca
router.post(
    "/",
    requireAuth,
    createBoat
);

module.exports = router;