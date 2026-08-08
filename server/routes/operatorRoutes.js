const express = require("express");

const {
    getOperators
} = require("../controllers/operatorController");

const {
    requireOperator
} = require("../middleware/authMiddleware");

const router = express.Router();

// Solo un operatore può vedere l'elenco
// degli operatori disponibili.
router.get(
    "/",
    requireOperator,
    getOperators
);

module.exports = router;