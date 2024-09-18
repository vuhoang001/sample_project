const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "ForgetPassword";
const COLLECTION_NAME = "ForgetPasswords";

const forgetPasswordSchema = new Schema(
  {
    email: String,
    token: String,
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

forgetPasswordSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

module.exports = model(DOCUMENT_NAME, forgetPasswordSchema);
