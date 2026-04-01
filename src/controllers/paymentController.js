// const axios = require("axios");
// const Payment = require("../models/Payment");
// const { logEvent } = require("../services/logger");

// // 🔥 Create Payment
// exports.createPayment = async (req, res) => {
//   try {
//     const { amount, userId } = req.body;

//     const reference = "REF_" + Date.now();
//     console.log(amount,userId)
//     const response = await axios.post(
//       `${process.env.HITPAY_BASE_URL}/payment-requests`,
//       {
//         amount,
//         currency: "SGD",
//         email: "test@email.com",
//         reference_number: reference,
//         webhook: process.env.WEBHOOK_URL,
//         redirect_url: "https://example.com/success",
//         payment_methods: ["paynow_online", "card"]
//       },
//       {
//         headers: {
//           "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY
//         }
//       }
//     );
// console.log("payment response ",response)
// const payment = await Payment.create({
//   amount,
//   userId,
//   payment_id: response.data.id, // 🔥 THIS IS payment_request_id
//   reference
// });
// console.log("below payment ",payment)
//     await logEvent("CREATE_PAYMENT", response.data);

//     res.json({
//       paymentUrl: response.data.url,
//       payment
//     });

//   } catch (error) {
//     console.error(error?.response, error?.message);
//     res.status(500).json({ error: "Payment creation failed" });
//   }
// };

// // 🔥 Webhook
// exports.hitpayWebhook = async (req, res) => {
//   try {
//     console.log("WEBHOOK HIT:", req.body);

//     const data = req.body;

//     // 🔥 IMPORTANT: use payment_request_id (not payment_id)
//     const payment = await Payment.findOne({
//       payment_id: data.payment_request_id
//     });
// console.log("statuspayment ",payment)
//     if (!payment) {
//       console.log("❌ Payment not found in DB");
//       return res.status(404).json({ message: "Payment not found" });
//     }

//     // ✅ Update status
//     payment.status = data.status;
//     await payment.save();

//     console.log("✅ PAYMENT UPDATED");

//     res.status(200).json({ message: "Webhook processed" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Webhook error" });
//   }
// };

// // 🔥 Get Wallet Balance
// exports.getWallet = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const payments = await Payment.find({
//       userId,
//       status: "completed"
//     });
//     console.log("userIdrt ",userId,payments)
//     // const total = payments[payments?.length - 1]?.amount || 0;
//     const total = payments.reduce((sum, payment) => {
//   return sum + (payment.amount || 0);
// }, 0);
//  console.log("userId ",userId,total)
//     res.json({ balance: total });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch wallet" });
//   }
// };

// // 🔥 Get Payment Status
// exports.getPaymentStatus = async (req, res) => {
//   const { id } = req.params;

//   const payment = await Payment.findById(id);
//   res.json(payment);
// };


// controllers/paymentController.js
const axios = require("axios");
const Payment = require("../models/Payment");
const { logEvent } = require("../services/logger");

// ✅ Create Payment
exports.createPayment = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ error: "amount and userId are required" });
    }

    const reference = "REF_" + Date.now();
    console.log("Creating payment — amount:", amount, "userId:", userId);

    const response = await axios.post(
      `${process.env.HITPAY_BASE_URL}/payment-requests`,
      {
        amount,
        currency: "SGD",
        email: "test@email.com",
        reference_number: reference,
        webhook: process.env.WEBHOOK_URL,
        redirect_url: "https://example.com/success",
        payment_methods: ["paynow_online", "card"]
      },
      {
        headers: {
          "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ HitPay response:", response.data);

    // ✅ Save payment to DB with payment_request_id
    const payment = await Payment.create({
      amount,
      userId,
      payment_id: response.data.id, // this is payment_request_id from HitPay
      reference,
      status: "pending"
    });

    console.log("✅ Payment saved to DB:", payment);

    await logEvent("CREATE_PAYMENT", response.data);

    res.json({
      paymentUrl: response.data.url,
      payment
    });

  } catch (error) {
    console.error("❌ createPayment error:", error?.response?.data || error?.message);
    res.status(500).json({ error: "Payment creation failed" });
  }
};

// ✅ Webhook — called by HitPay after payment is completed
// exports.hitpayWebhook = async (req, res) => {
//   try {
//     console.log("✅ WEBHOOK HIT — body:", req.body);

//     const data = req.body;

//     // ✅ HitPay sends payment_request_id in webhook body
//     const payment = await Payment.findOne({
//       payment_id: data.payment_request_id
//     });

//     console.log("Payment found in DB:", payment);

//     if (!payment) {
//       console.log("❌ Payment not found for payment_request_id:", data.payment_request_id);
//       return res.status(404).json({ message: "Payment not found" });
//     }

//     // ✅ Update status (completed / failed)
//     payment.status = data.status;
//     await payment.save();

//     console.log("✅ Payment status updated to:", data.status);

//     res.status(200).json({ message: "Webhook processed" });

//   } catch (error) {
//     console.error("❌ hitpayWebhook error:", error);
//     res.status(500).json({ error: "Webhook error" });
//   }
// };

exports.hitpayWebhook = async (req, res) => {
  try {
    console.log("✅ CONTROLLER EXECUTED");
    console.log("✅ WEBHOOK HIT — body:", req.body);

    const data = req.body;

    // ✅ New event webhook payload has different structure
    // Log it first to see exact field names
    console.log("Payment data:", JSON.stringify(data, null, 2));

    // ✅ Try both field names to be safe
    const paymentRequestId = data.payment_request_id 
      || data?.data?.payment_request_id 
      || data?.id;

    console.log("Looking for payment_request_id:", paymentRequestId);

    const payment = await Payment.findOne({
      payment_id: paymentRequestId
    });

    if (!payment) {
      console.log("❌ Payment not found for id:", paymentRequestId);
      return res.status(404).json({ message: "Payment not found" });
    }

    const status = data.status || data?.data?.status;
    payment.status = status;
    await payment.save();

    console.log("✅ Payment status updated to:", status);

    res.status(200).json({ message: "Webhook processed" });

  } catch (error) {
    console.error("❌ hitpayWebhook error:", error);
    res.status(500).json({ error: "Webhook error" });
  }
};

// ✅ Get Wallet Balance — sum of all completed payments for a user
exports.getWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({
      userId,
      status: "pending"
    });

    console.log("Wallet query — userId:", userId, "completed payments:", payments.length);

    const total = payments.reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0);

    console.log("Total wallet balance:", total);

    res.json({ balance: total });

  } catch (error) {
    console.error("❌ getWallet error:", error);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
};

// ✅ Get All Payments (History)
exports.getAllPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 }); // latest first

    console.log("📊 Payments fetched:", payments.length);

    // ✅ Format response
    const formattedPayments = payments.map((p) => ({
      date: p.createdAt,
      amount: p.amount,
      status: p.status
    }));

    res.json({
      count: formattedPayments.length,
      payments: formattedPayments
    });

  } catch (error) {
    console.error("❌ getAllPayments error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

// ✅ Get Single Payment Status by DB _id
exports.getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    console.error("❌ getPaymentStatus error:", error);
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
};