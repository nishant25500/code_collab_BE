const mongoose = require("../config/MongoConnect");

const PendingAccountRecoverSchema = new mongoose.Schema({
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
  "PendingAccountRecover",
  PendingAccountRecoverSchema
);
