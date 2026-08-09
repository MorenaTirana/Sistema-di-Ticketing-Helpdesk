const express = require("express");

const authController =
    require("../controllers/authController");

const {
    requireAuth
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/register",
    authController.register
);

router.post(
    "/login",
    authController.login
);

router.post(
    "/forgot-password",
    authController.requestPasswordReset
);

router.post(
    "/reset-password",
    authController.resetPassword
);

router.get(
    "/me",
    requireAuth,
    authController.getCurrentUser
);

router.patch(
    "/profile",
    requireAuth,
    authController.updateProfile
);

router.patch(
    "/password",
    requireAuth,
    authController.changePassword
);

router.post(
    "/logout",
    requireAuth,
    authController.logout
);

module.exports = router;