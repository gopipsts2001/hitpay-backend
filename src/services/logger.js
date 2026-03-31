const PaymentLog = require("../models/PaymentLog");

const logEvent = async (type, data) => {
  try {
    await PaymentLog.create({ type, data });
  } catch (err) {
    console.error("Logging failed", err);
  }
};

module.exports = { logEvent };