// const fsPromises = require('fs').promises;
// const path = require('path');
// const bcrypt = require('bcrypt');
const PendingAccountVerification = require("../model/PendingAccountVerification");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const transporter = require("../config/MailTransporter");

const handleNewUser = async (req, res) => {
  const { username, password, email, name } = req.body;
  if (!username || !password || !name || !email)
    return res.status(400).json({ message: "All fields are required." });
  // check for duplicate usernames in the db
  const usernameDuplicate = await User.findOne({ username: username });
  //   console.log(usernameDuplicate);
  if (usernameDuplicate)
    return res.status(409).json({
      message: `Username ${username} already exists.`,
      success: false,
    });

  const emailDuplicate = await User.findOne({ email: email });
  if (emailDuplicate)
    return res.status(409).json({
      message: `Email ${email} already exists.`,
      success: false,
    });

  try {
    const newUser = new User({
      username: username,
      name: name,
      email: email,
      isOAuth: false,
      isAccountVerified: false,
      picture: "/assets/images/avatar.png",
      roles: { User: 2001 },
      password: password,
    });
    const savedUser = await newUser.save();

    const accountVerification = new PendingAccountVerification({
      authCode: await bcrypt.hash(email, 12),
      email: email,
    });
    await accountVerification.save();

    transporter.sendMail(
      {
        // from: "guptakabhay929@gmail.com",
        from: "sudhanshuchaubey273@gmail.com",
        to: email,
        subject: "Account Verification",
        html: `<h1>Click on the link below to verify your account</h1>
      <a href="${process.env.FRONTEND_URL}/auth/success?token=${accountVerification.authCode}">Verify Account</a>
      <br/>
      <p>Or copy and paste the following link in your browser</p>
      <p>${process.env.FRONTEND_URL}/auth/success?token=${accountVerification.authCode}</p>

      <p>Thank you for registering with us.</p>
      <i>Thanks & Regards,</i>
      <p>Sudhansuh Chaubey</p>
  <p>Code Collab</p>
<!--      <a href="https://codebuddyapp.tk">https://codebuddyapp.tk</a>-->`,
      },
      (err, info) => {
        if (err) {
          console.log(err);
        } else {
          // console.log(info);
        }
      }
    );

    return res
      .status(201)
      .json({ success: true, message: `New username ${username} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
