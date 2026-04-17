// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();

const {
  createPayment,
  hitpayWebhook,
  getPaymentStatus,
  getWallet,
  getAllPayments
} = require("../controllers/paymentController");

const verifyHitPay = require("../middleware/verifyHitPay");

// ✅ Specific routes first
router.post("/create", createPayment);


router.post("/webhook", (req, res, next) => {
  console.log("🔥 WEBHOOK ROUTE HIT");
  next();
}, verifyHitPay, hitpayWebhook);
// router.post("/webhook", verifyHitPay, hitpayWebhook);

router.get("/wallet/:userId", getWallet);
router.get("/history/:userId", getAllPayments);

// ✅ Dynamic route last
router.get("/:id", getPaymentStatus);

module.exports = router;