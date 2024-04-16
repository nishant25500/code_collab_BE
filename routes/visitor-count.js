const express = require("express");
const Visitor = require("../model/Visitor");
const router = express.Router();

router.route("/").get(async (req, res) => {
  const CurrentVistorStats = await Visitor.findOne({});
  if (CurrentVistorStats) {
    CurrentVistorStats.visitorCount = CurrentVistorStats.visitorCount + 1;
    await CurrentVistorStats.save();
    return res
      .status(200)
      .json({ visitorCount: CurrentVistorStats.visitorCount });
  } else {
    const newVisitor = new Visitor({
      visitorCount: 1,
    });
    await newVisitor.save();
    return res.status(200).json({ visitorCount: 1 });
  }
});

module.exports = router;
