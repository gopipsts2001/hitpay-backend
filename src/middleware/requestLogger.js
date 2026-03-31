const { logEvent } = require("../services/logger");

const requestLogger = (req, res, next) => {
  logEvent("REQUEST", {
    method: req.method,
    url: req.originalUrl,
    body: req.body
  });
  next();
};

module.exports = requestLogger;