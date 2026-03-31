// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();

const {
  createPayment,
  hitpayWebhook,
  getPaymentStatus,
  getWallet
} = require("../controllers/paymentController");

const verifyHitPay = require("../middleware/verifyHitPay");

// ✅ Specific routes first
router.post("/create", createPayment);

// ✅ Webhook: urlencoded parser applied here only, before verifyHitPay
router.post(
  "/webhook",
  express.urlencoded({ extended: false }),
  verifyHitPay,
  hitpayWebhook
);

router.get("/wallet/:userId", getWallet);

// ✅ Dynamic route last
router.get("/:id", getPaymentStatus);

module.exports = router;