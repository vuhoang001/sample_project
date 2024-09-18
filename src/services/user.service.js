const userModel = require("../models/account.model");
const keyModel = require("../models/keyToken.model");
const forgetPasswordModel = require("../models/forgetPassword.model");

const { sendMail } = require("../configs/nodemailer.config");

const {
  BadRequestError,
  AuthFailureError,
  NotFoundError,
} = require("../core/error.response");

const { createTokenPair } = require("../helpers/Auth.helper");
const { getInfoData } = require("../utils/index");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class UserService {
  home = async () => {
    return "123";
  };

  register = async (payload) => {
    const { username, password, email } = payload;
    const holderAccount = await userModel.findOne({ email: email });
    if (holderAccount) throw new BadRequestError("Error: Account is registed!");
    const hashPassword = await bcrypt.hash(password, 10);
    const newAccount = await userModel.create({
      name: username,
      password: hashPassword,
      email: email,
    });

    if (!newAccount)
      throw new BadRequestError("Error: Something went wrong! Try again!");

    return {
      user: getInfoData({
        fields: ["_id", "name", "email"],
        object: newAccount,
      }),
    };
  };

  login = async ({ email, password }) => {
    const holderAccount = await userModel.findOne({ email: email });
    if (!holderAccount)
      throw new NotFoundError("Error: Account is wrong or not registed!");

    const match = await bcrypt.compare(password, holderAccount.password);

    if (!match)
      throw new NotFoundError("Error: Account is wrong or not registed!");

    const tokens = await createTokenPair({
      userId: holderAccount._id,
      email: holderAccount.email,
    });

    if (!tokens) throw new BadRequestError("Error: Something went wrong!");

    const CreateKeys = await keyModel.findOneAndUpdate(
      {
        user: holderAccount._id,
      },
      {
        refreshToken: tokens.refreshToken,
      },
      { new: true, upsert: true }
    );

    if (!CreateKeys)
      throw new BadRequestError("Error: can not create or update KeyStore");
    return {
      user: getInfoData({
        fields: ["_id", "name", "email"],
        object: holderAccount,
      }),
      accessToken: tokens.accessToken,
      accessTokenExpired: tokens.accessTokenExpired,
      refreshToken: tokens.refreshToken,
      refreshTokenExpired: tokens.refreshTokenExpired,
    };
  };

  logout = async (user) => {
    const res = await keyModel.deleteOne({
      user: user.userId,
    });
    return res;
  };

  handleRefreshToken = async (user, refreshToken) => {
    const { _id, email } = user;
    const keyHolder = await keyModel.findOne({ refreshToken: refreshToken });
    if (!keyHolder) throw new BadRequestError("Unauthorcation");

    if (keyHolder.refreshTokenUsed.includes(refreshToken)) {
      await keyModel.findOneAndDelete({ user: _id });
      throw new AuthFailureError("Error: Something went wrong! Try again!");
    }

    const holderAccount = await userModel.findOne({ email: email });

    if (!holderAccount)
      throw new AuthFailureError("Error: Something went wrong! Try again!");

    const tokens = await createTokenPair({
      userId: holderAccount._id,
      email: holderAccount.email,
    });

    if (!tokens)
      throw new AuthFailureError("Error: Something went wrong! Try again!");

    const holderTokens = await keyModel.findOne({ user: holderAccount._id });

    if (!holderTokens)
      AuthFailureError("Error: Something went wrong! Try again!");

    const res = await holderTokens.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken,
      },
    });

    if (!res) throw new BadRequestError("Error: Cant set or update res");

    return {
      user: {
        _id: holderAccount._id,
        name: holderAccount.name,
        email: holderAccount.email,
      },

      accessToken: tokens.accessToken,
      atokenExp: tokens.atokenExp,
      refreshToken: tokens.refreshToken,
      rtokenExp: tokens.rtokenExp,
    };
  };

  handleOTP = async ({ email }) => {
    const holderAccount = await userModel.findOne({ email: email });
    if (!holderAccount) throw new AuthFailureError("Invalid email");

    const resetToken = crypto.randomBytes(64).toString("hex");

    const hash = await bcrypt.hash(resetToken, 10);

    const forgetPasswordObject = await forgetPasswordModel.create({
      email: email,
      token: hash,
    });

    if (!forgetPasswordObject) throw new BadRequestError("Cant create OTP");

    const link = `${process.env.URL_SERVER}/passwordReset?token=${resetToken}&email=${email}`;
    sendMail(email, link);

    return link;
  };

  resetPassword = async (newPassword, token, email) => {
    const holderForgetPassword = await forgetPasswordModel.findOne({
      email: email,
    });

    if (!holderForgetPassword) throw new AuthFailureError("Invalid email");

    const match = await bcrypt.compare(token, holderForgetPassword.token);

    if (!match)
      throw new BadRequestError("Invalid or expired password reset token!");

    const holderAccount = await userModel.findOneAndUpdate(
      { email: email },
      {
        $set: { password: newPassword },
      }
    );
    if (!holderAccount)
      throw new BadRequestError("Something went wrong! Try later");
    return "Success!";
  };
}

module.exports = new UserService();
