const express = require("express");
const route = express.Router();

route.use("/", require("./user.route"));

module.exports = route;
