const express = require("express");

const technicalCommunicationController =
    require("../controllers/technicalCommunicationController");

const {
    requireOperator
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    requireOperator,
    technicalCommunicationController.createCommunicationDraft
);

router.patch(
    "/:id/send",
    requireOperator,
    technicalCommunicationController.sendCommunicationToClient
);

module.exports = router;
