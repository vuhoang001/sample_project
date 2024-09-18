const jwt = require("jsonwebtoken");
const { AuthFailureError, BadRequestError } = require("../core/error.response");
const userModel = require("../models/account.model");
const AsyncHanlde = require("../helpers/AsyncHandle.helpers");
const accountModel = require("../models/account.model");
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};

const createTokenPair = async (payload) => {
  try {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "6h",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    const refreshTokenTime = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const accessTokenTime = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      refreshTokenExpired: refreshTokenTime.exp,
      accessTokenExpired: accessTokenTime.exp,
    };
  } catch (error) {
    console.log(error);
  }
};

const authentication = AsyncHanlde(async (req, res, next) => {
  const Bearer = req.headers[HEADER.AUTHORIZATION];
  const refreshToken = req.headers[HEADER.REFRESHTOKEN];
  let accessToken;
  if (Bearer) accessToken = Bearer.split(" ")[1];

  if (!refreshToken && !accessToken)
    throw new BadRequestError("Error: Missing refreshToken or accessToken");

  if (refreshToken) {
    console.log("refreshToken", refreshToken);
    const decodeUser = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );


    const holderAccount = await accountModel.findOne({
      _id: decodeUser.userId,
    });

    if (!holderAccount)
      throw new AuthFailureError("Error: Invalid access token!");

    req.user = holderAccount;
    req.refreshToken = refreshToken;
    return next();
  }

  if (accessToken) {
    const decodedUser = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const holderAccount = await accountModel.findOne(decodedUser.UserId);
    if (!holderAccount)
      throw new AuthFailureError("Error: Invalid access token!");
    req.user = decodedUser;
    return next();
  }
});

module.exports = {
  createTokenPair,
  authentication,
};
