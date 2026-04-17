
const crypto = require("crypto");

const verifyHitPay = (req, res, next) => {
  console.log("=== HitPay Webhook Verification ===");

  try {
    // ✅ Guard: body must exist
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("❌ Empty body");
      return res.status(400).json({ message: "Empty body" });
    }

    console.log("Full body:", req.body);
    console.log("Headers:", req.headers);

    // ✅ New event webhook uses 'Hitpay-Signature' header
    const receivedSignature = req.headers["hitpay-signature"];
    console.log("Hitpay-Signature header:", receivedSignature);

    if (!receivedSignature) {
      console.log("❌ No Hitpay-Signature header found");
      return res.status(400).json({ message: "Missing signature" });
    }

    // ✅ Compute HMAC over raw JSON body string
    // const rawBody = JSON.stringify(req.body);
    console.log("Raw body for HMAC:", rawBody);

    const computedHash = crypto
      .createHmac("sha256", process.env.HITPAY_SALT)
      .update(rawBody)
      .digest("hex");

    console.log("Computed  :", computedHash);
    console.log("Received  :", receivedSignature);

    if (computedHash !== receivedSignature) {
      console.log("❌ Signature mismatch");
      return res.status(400).json({ message: "Invalid signature" });
    }

    console.log("✅ Signature verified successfully");
    next();

  } catch (err) {
    console.error("❌ verifyHitPay error:", err.message);
    return res.status(500).json({ message: "Signature verification failed" });
  }
};

module.exports = verifyHitPay;