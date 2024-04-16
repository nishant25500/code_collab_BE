const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/", authController.handleLogin);
router.post("/o-auth", authController.handleOAuthLogin);
router.get("/success", authController.handleAccountVerification);
router.get("/forgot-password", authController.handleForgotPassword);
router.get("/recover", authController.handleAccountRecoveryTokenVerify);
router.put("/recover", authController.handleAccountRecovery);
module.exports = router;
