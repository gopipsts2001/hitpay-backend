const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  type: String,
  data: Object
}, { timestamps: true });

module.exports = mongoose.model("PaymentLog", logSchema);