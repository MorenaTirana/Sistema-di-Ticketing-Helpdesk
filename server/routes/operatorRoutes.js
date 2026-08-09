const express = require("express");

const {
    getOperators,
    getClients
} = require("../controllers/operatorController");

const {
    requireOperator
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/clients",
    requireOperator,
    getClients
);

// Solo un operatore può vedere l'elenco
// degli operatori disponibili.
router.get(
    "/",
    requireOperator,
    getOperators
);

module.exports = router;