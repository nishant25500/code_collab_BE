const mongoose = require("../config/MongoConnect");

const PendingAccountVerificationSchema = new mongoose.Schema({
  authCode: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(
  "PendingAccountVerification",
  PendingAccountVerificationSchema
);
