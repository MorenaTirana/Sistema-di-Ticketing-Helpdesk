const express = require("express");

const {
    getOperators,
    getClients,
    createOperator,
    updateOperator,
    updateOperatorStatus
} = require("../controllers/operatorController");

const {
    requireOperator,
    requireOperatorManager
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/clients",
    requireOperator,
    getClients
);

router.get(
    "/",
    requireOperator,
    getOperators
);

router.post(
    "/",
    requireOperatorManager,
    createOperator
);

router.patch(
    "/:id/status",
    requireOperatorManager,
    updateOperatorStatus
);

router.patch(
    "/:id",
    requireOperatorManager,
    updateOperator
);

module.exports = router;