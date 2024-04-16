const express = require("express");
const User = require("../../model/User");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.route("/account").put(async (req, res, next) => {
  const token = req?.cookies?.jwt_access;
  if (!token)
    return res.status(401).json({
      message: "You're not allowed to perform this action",
    });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err)
      return res.status(403).json({
        message: "Invalid Token",
      });
    const username = decoded.UserInfo.username;
    const foundUser = await User.findOne({
      username,
    });
    if (!foundUser) {
      return res.status(403).json({
        message: "User does not exists",
      });
    }
    foundUser.username = req.body.username;
    foundUser.name = req.body.name;
    await foundUser.save();
    res.status(200).json({
      message: "Account Updated Successfully",
    });
  });
});

router.route("/security").put(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (currentPassword === newPassword) {
    return res.status(403).json({
      message: "New and current password cannot be same",
    });
  }

  const token = req?.cookies?.jwt_access;
  if (!token)
    return res.status(401).json({
      message: "You're not allowed to perform this action",
    });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err)
      return res.status(403).json({
        message: "Invalid Token",
      });
    const username = decoded.UserInfo.username;
    const foundUser = await User.findOne({
      username,
    });
    if (!foundUser) {
      return res.status(403).json({
        message: "User does not exists",
      });
    }
    const resp = await foundUser.comparePassword(currentPassword);
    if (!resp) {
      return res.status(401).json({
        message: "Incorrect current Password",
      });
    }
    foundUser.password = newPassword;
    await foundUser.save();
    res.status(200).json({
      message: "Password Updated Successfully",
    });
  });
});

module.exports = router;
