require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
connectDB();

app.use(cors());

// ✅ JSON for everything — event webhook also sends JSON now
// app.use(express.json());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // ✅ capture raw body for signature
    }
  })
);

app.use((req, res, next) => {
  console.log("req.originalUrl", req.originalUrl);
  next();
});

app.use("/api/payment", paymentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
  console.log(`📡 Webhook: POST /api/payment/webhook`);
});