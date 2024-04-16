const express = require("express");
const User = require("../../model/User");
const router = express.Router();

router.route("/:username").get(async (req, res) => {
  const { username } = req.params;
  const foundUser = await User.findOne({
    username,
  });
  if (!foundUser) {
    return res.status(403).json({
      message: "User does not exists",
    });
    
  }
  return res.send({
    username: foundUser.username,
    name: foundUser.name,
    picture: foundUser.picture,
    problemsSolved: foundUser.problemSolved || [],
  });
});

module.exports = router;