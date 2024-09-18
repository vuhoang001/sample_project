const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

app.use(cors());
app.use(helmet());
app.use(morgan());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("./database/init.mongodb");

app.use("/", require("./routes/index.route"));

app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  const status = err.status || 501;
  return res.status(status).json({
    status: "Error",
    code: status,
    stack: err.stack,
    message: err.message || "Internal server error",
  });
});

module.exports = app;
