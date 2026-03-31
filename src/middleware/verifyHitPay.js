// const crypto = require("crypto");

// const verifyHitPay = (req, res, next) => {
//   console.log("within verify");

//   const receivedSignature = req.body.hmac;
//   console.log("receivedSignature:", receivedSignature);

//   // 🔥 Step 1: remove hmac
//   const { hmac, ...data } = req.body;

//   // 🔥 Step 2: remove empty values
//   const filtered = Object.keys(data)
//     .filter(key => data[key] !== "")
//     .reduce((obj, key) => {
//       obj[key] = data[key];
//       return obj;
//     }, {});

//   // 🔥 Step 3: SORT KEYS (CRITICAL)
//   const payload = Object.keys(filtered)
//     .sort()
//     .map(key => `${key}=${filtered[key]}`)
//     .join("&");

//   console.log("payload:", payload);

//   const hash = crypto
//     .createHmac("sha256", process.env.HITPAY_SALT)
//     .update(payload)
//     .digest("hex");

//   console.log("generated hash:", hash);

//   if (hash !== receivedSignature) {
//     console.log("❌ Invalid signature");
//     return res.status(400).json({ message: "Invalid signature" });
//   }

//   console.log("✅ Signature verified");
//   next();
// };

// module.exports = verifyHitPay;


// const crypto = require("crypto");

// const verifyHitPay = (req, res, next) => {
//   console.log("=== HitPay Webhook Verification ===");

//   try {
//     const body = req.body;
//     const receivedSignature = body.hmac;

//     console.log("Received HMAC  :", receivedSignature);
//     console.log("Full body      :", body);

//     if (!receivedSignature) {
//       console.log("❌ No HMAC in payload");
//       return res.status(400).json({ message: "Missing HMAC signature" });
//     }

//     // ✅ STEP 1: Remove 'hmac' key from body
//     // ✅ STEP 2: Sort remaining keys alphabetically
//     // ✅ STEP 3: Concatenate as key+value (no separator, no encoding)
//     const sortedKeys = Object.keys(body)
//       .filter((key) => key !== "hmac")
//       .sort();

//     console.log("Sorted keys    :", sortedKeys);

//     const payloadString = sortedKeys
//       .map((key) => `${key}${body[key]}`)
//       .join("");

//     console.log("Payload string :", payloadString);

//     // ✅ STEP 4: HMAC-SHA256 with your HITPAY_SALT
//     const computedHash = crypto
//       .createHmac("sha256", process.env.HITPAY_SALT)
//       .update(payloadString)
//       .digest("hex");

//     console.log("Computed HMAC  :", computedHash);
//     console.log("Received HMAC  :", receivedSignature);

//     if (computedHash !== receivedSignature) {
//       console.log("❌ HMAC mismatch — invalid signature");
//       return res.status(400).json({ message: "Invalid signature" });
//     }

//     console.log("✅ HMAC verified successfully");
//     next();

//   } catch (err) {
//     console.error("❌ verifyHitPay error:", err.message);
//     return res.status(500).json({ message: "Signature verification failed" });
//   }
// };

// module.exports = verifyHitPay;


// const verifyHitPay = (req, res, next) => {
//   console.log("=== HitPay Webhook Verification ===");

//   try {
//     // ✅ Guard against undefined body
//     if (!req.body || Object.keys(req.body).length === 0) {
//       console.log("❌ Empty or unparsed body");
//       return res.status(400).json({ message: "Empty body" });
//     }

//     const body = req.body;
//     const receivedSignature = body.hmac;

//     console.log("Received HMAC  :", receivedSignature);
//     console.log("Full body      :", body);

//     if (!receivedSignature) {
//       console.log("❌ No HMAC in payload");
//       return res.status(400).json({ message: "Missing HMAC signature" });
//     }

//     const sortedKeys = Object.keys(body)
//       .filter((key) => key !== "hmac")
//       .sort();

//     console.log("Sorted keys    :", sortedKeys);

//     const payloadString = sortedKeys
//       .map((key) => `${key}${body[key]}`)
//       .join("");

//     console.log("Payload string :", payloadString);

//     const computedHash = crypto
//       .createHmac("sha256", process.env.HITPAY_SALT)
//       .update(payloadString)
//       .digest("hex");

//     console.log("Computed HMAC  :", computedHash);
//     console.log("Received HMAC  :", receivedSignature);

//     if (computedHash !== receivedSignature) {
//       console.log("❌ HMAC mismatch — invalid signature");
//       return res.status(400).json({ message: "Invalid signature" });
//     }

//     console.log("✅ HMAC verified successfully");
//     next();

//   } catch (err) {
//     console.error("❌ verifyHitPay error:", err.message);
//     return res.status(500).json({ message: "Signature verification failed" });
//   }
// };

// middleware/verifyHitPay.js
const crypto = require("crypto");

const verifyHitPay = (req, res, next) => {
  console.log("=== HitPay Webhook Verification ===");

  try {
    // ✅ Guard: body must exist and be parsed
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("❌ Empty or unparsed body — urlencoded parser may have failed");
      return res.status(400).json({ message: "Empty body" });
    }

    const body = req.body;
    const receivedSignature = body.hmac;

    console.log("Full body      :", body);
    console.log("Received HMAC  :", receivedSignature);

    if (!receivedSignature) {
      console.log("❌ No HMAC in payload");
      return res.status(400).json({ message: "Missing HMAC signature" });
    }

    // ✅ Sort keys alphabetically, exclude 'hmac'
    const sortedKeys = Object.keys(body)
      .filter((key) => key !== "hmac")
      .sort();

    console.log("Sorted keys    :", sortedKeys);

    // ✅ Concatenate as key+value with no separator
    const payloadString = sortedKeys
      .map((key) => `${key}${body[key]}`)
      .join("");

    console.log("Payload string :", payloadString);

    // ✅ HMAC-SHA256 with HITPAY_SALT
    const computedHash = crypto
      .createHmac("sha256", process.env.HITPAY_SALT)
      .update(payloadString)
      .digest("hex");

    console.log("Computed HMAC  :", computedHash);
    console.log("Received HMAC  :", receivedSignature);

    if (computedHash !== receivedSignature) {
      console.log("❌ HMAC mismatch — invalid signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    console.log("✅ HMAC verified successfully");
    next();

  } catch (err) {
    console.error("❌ verifyHitPay error:", err.message);
    return res.status(500).json({ message: "Signature verification failed" });
  }
};


module.exports = verifyHitPay;