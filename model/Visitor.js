const mongoose = require("../config/MongoConnect");

const VisitorsSchema = new mongoose.Schema(
  {
    visitorCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Visitor", VisitorsSchema);
