const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: Number,
  currency: { type: String, default: "SGD" },
  status: { type: String, default: "pending" },
  reference: String,
  payment_id: String,
  userId: String
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);