const userService = require("../services/user.service");
const { SuccessResponse } = require("../core/success.response");

class UserController {
  get = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await userService.home(),
    }).send(res);
  };

  register = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await userService.register(req.body),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await userService.login(req.body),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await userService.logout(req.user),
    }).send(res);
  };

  handleRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await userService.handleRefreshToken(
        req.user,
        req.refreshToken
      ),
    }).send(res);
  };

  handleOTP = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await userService.handleOTP(req.body),
    }).send(res);
  };

  resetPassword = async (req, res, next) => {
    const token = req.query.token;
    const email = req.query.email;
    const { password } = req.body;
    new SuccessResponse({
      message: "Success",
      metadata: await userService.resetPassword(password, token, email),
    }).send(res);
  };
}

module.exports = new UserController();
