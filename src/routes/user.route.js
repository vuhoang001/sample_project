const express = require("express");
const route = express.Router();
const AsyncHandle = require("../helpers/AsyncHandle.helpers");
const userController = require("../controllers/user.controller");
const passport = require("passport");
require("../configs/passportGoogle.config");
require("../configs/passportFacebook.config");

const { authentication } = require("../helpers/Auth.helper");
route.use(passport.initialize());

route.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

route.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    res.json(req.profile);
  }
);

// route.get(
//   "/auth/facebook",
//   passport.authenticate("facebook", { scope: ["email"] })
// );

// route.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", { session: false }),
//   (req, res) => {
//     res.json(req.profile);
//   }
// );

route.post("/register", AsyncHandle(userController.register));
route.post("/login", AsyncHandle(userController.login));
route.post("/handle-OTP", AsyncHandle(userController.handleOTP));
route.post("/passwordReset", AsyncHandle(userController.resetPassword));

route.use(authentication);

route.get("/", AsyncHandle(userController.get));
route.post("/logout", AsyncHandle(userController.logout));
route.post("/handle-refresh", AsyncHandle(userController.handleRefreshToken));
module.exports = route;
