const jwt = require("jsonwebtoken");
const PendingAccountVerification = require("../model/PendingAccountVerification");
require("dotenv").config();

const User = require("../model/User");
const transporter = require("../config/MailTransporter");
const bcrypt = require("bcrypt");
const PendingAccountRecover = require("../model/PendingAccountRecover");

const handleLogin = async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password)
        return res
            .status(400)
            .json({login: false, message: "Username and password are required."});
    const foundUser = await User.findOne({username: username});
    if (!foundUser) return res.sendStatus(401); //Unauthorized
    // evaluate password
    const match = await foundUser.comparePassword(password);
    //   console.log(match);
    if (!match) return res.sendStatus(401); //Unauthorized
    const roles = Object.values(foundUser.roles);
    // create JWTs
    const accessToken = jwt.sign(
        {
            UserInfo: {
                username: foundUser.username,
                roles,
                name: foundUser.name,
                email: foundUser.email,
                picture: foundUser.picture,
                isAccountVerified: foundUser.isAccountVerified,
                problemSolved: foundUser.problemSolved,
            },
        },
        "" + process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "400h"}
    );
    const refreshToken = jwt.sign(
        {username: foundUser.username},
        "" + process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "1d"}
    );
    // Saving refreshToken with current username
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });
    // ##############################################################
    res.cookie("jwt_access", accessToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 4 * 60 * 60 * 1000,
    });
    res.json({
        username: foundUser.username,
        roles,
        accessToken,
        name: foundUser.name,
        email: foundUser.email,
        picture: foundUser.picture,
        isAccountVerified: foundUser.isAccountVerified,
        problemSolved: foundUser.problemSolved,
    });
};

const handleOAuthLogin = async (req, res) => {
    const {email, name, picture} = req.body;
    if (!email || !name)
        return res.status(400).json({
            login: false,
            message: "Username, email, name and picture are required.",
        });
    var foundUser = await User.findOne({email: email});
    if (foundUser) {
        foundUser.name = name;
        // foundUser.picture = picture;
        await foundUser.save();
    } else {
        // create new user with OAuth credentials

        const newUser = new User({
            username: email.split("@")[0],
            name: name,
            email: email,
            isAccountVerified: true,
            picture: picture,
            roles: {User: 2001},
        });

        foundUser = await newUser.save();
        // const roles = Object.values(savedUser.roles);
        // create JWTs
    }
    const roles = Object.values(foundUser.roles);
    // create JWTs
    const accessToken = jwt.sign(
        {
            UserInfo: {
                email: foundUser.email,
                name: name,
                picture: picture,
                username: foundUser.username,
                roles: roles,
                isAccountVerified: foundUser.isAccountVerified,
                problemSolved: foundUser.problemSolved,
            },
        },
        "" + process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "4h"}
    );
    const refreshToken = jwt.sign(
        {username: foundUser.username},
        "" + process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "1d"}
    );
    // Saving refreshToken with current username
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });
    // ##############################################################
    res.cookie("jwt_access", accessToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 4 * 60 * 60 * 1000,
    });
    res.json({
        username: foundUser.username,
        roles,
        accessToken,
        name: foundUser.name,
        email: foundUser.email,
        picture: foundUser.picture,
        isAccountVerified: foundUser.isAccountVerified,
    });
};

const handleAccountVerification = async (req, res) => {
    const {token} = req.query;
    if (!token) {
        return res.status(400).json({
            login: false,
            message: "AuthCode is required.",
        });
    }

    const foundPendingAccountVerification =
        await PendingAccountVerification.findOne({authCode: token});
    if (!foundPendingAccountVerification) {
        return res.status(401).json({
            message: "AuthCode is not valid.",
        }); //Unauthorized
    }

    const foundUser = await User.findOne({
        email: foundPendingAccountVerification.email,
    });

    // console.log(foundUser);
    if (!foundUser) {
        return res.status(401).json({
            message: "user is not valid.",
        }); //Unauthorized
    }

    foundUser.isAccountVerified = true;
    await foundUser.save();
    // delete foundPendingAccountVerification
    await foundPendingAccountVerification.deleteOne();

    transporter.sendMail(
        {
            from: "guptakabhay929@gmail.com",
            to: foundPendingAccountVerification.email,
            subject: "Thank you for registering with Code Buddy !",
            html: `<h1>Thanks for registering with Code Buddy !</h1>
    <br/>
    <p>Hi ${foundUser.name},</p>
    <p>Your account has been verified successfully.</p>
    <p>Now you can login to your account and start using Code Buddy.</p>
    <br/>

    <p>Happy Coding !</p>
    <br/>
    <i>Thanks & Regards,</i>
    <p>Abhay Gupta</p>
    <p>Code Buddy</p>
    <a href="https://codebuddyapp.tk">https://codebuddyapp.tk</a>`,
        },
        (err, info) => {
            if (err) {
                console.log(err);
            } else {
                // console.log(info);
            }
        }
    );
    return res.json({
        message: "Account verified successfully.",
    });
};

const handleForgotPassword = async (req, res) => {
    const {username} = req.query;
    if (!username) {
        return res.status(400).json({
            message: "Username is required",
        });
    }
    const FoundUser = await User.findOne({
        username,
    });
    if (!FoundUser) {
        return res.status(400).json({
            message: "No Account is associated with this account",
        });
    }
    const newPendingAccountRecover = new PendingAccountRecover({
        authCode: await bcrypt.hash(FoundUser.email, 12),
        email: FoundUser.email,
    });

    await newPendingAccountRecover.save();
    transporter.sendMail(
        {
            from: "guptakabhay929@gmail.com",
            to: FoundUser.email,
            subject: "Account Recovery for " + username,
            html: `<h1>Click on the link below to recover your account</h1>
    <a href="${process.env.FRONTEND_URL}/auth/recover?token=${newPendingAccountRecover.authCode}">Recover Account</a>
    <br/>
    <p>Or copy and paste the following link in your browser</p>
    <p>${process.env.FRONTEND_URL}/auth/recover?token=${newPendingAccountRecover.authCode}</p>

    <i>Thanks & Regards,</i>
    <p>Abhay Gupta</p>
    <p>Code Buddy</p>
    <a href="https://codebuddyapp.tk">https://codebuddyapp.tk</a>`,
        },
        (err, info) => {
            if (err) {
                console.log(err);
            } else {
                // console.log(info);
            }
        }
    );

    return res.status(201).json({
        success: true,
        message: `Recovery mail sent to your registered mail address`,
    });
};

const handleAccountRecoveryTokenVerify = async (req, res) => {
    const {token} = req.query;
    if (!token) {
        return res.status(400).json({
            login: false,
            message: "token is required.",
        });
    }

    const foundPendingAccountRecovery = await PendingAccountRecover({
        authCode: token,
    });
    if (!foundPendingAccountRecovery) {
        return res.status(403).json({
            message: "Token is invalid",
        });
    }

    return res.status(200).json({
        message: "Token is valid",
    });
};

const handleAccountRecovery = async (req, res) => {
    const {token} = req.query;
    if (!token) {
        return res.status(400).json({
            login: false,
            message: "token is required.",
        });
    }

    const {newPassword, confirmPassword} = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({
            message: "All Fields are required",
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(401).json({
            message: "Both new password and confirm password should be same",
        });
    }

    const foundPendingAccountRecovery = await PendingAccountRecover.findOne({
        authCode: token,
    });
    if (!foundPendingAccountRecovery) {
        return res.status(403).json({
            message: "Token is invalid",
        });
    }
    const foundUser = await User.findOne({
        email: foundPendingAccountRecovery.email,
    });

    if (!foundUser) {
        return res.status(400).json({
            message: "Account is not valid",
        });
    }

    foundUser.password = newPassword;
    await foundUser.save();
    await foundPendingAccountRecovery.deleteOne();

    return res.status(201).json({
        message: "Password has been successfully set",
    });
};

module.exports = {
    handleLogin,
    handleOAuthLogin,
    handleAccountVerification,
    handleForgotPassword,
    handleAccountRecoveryTokenVerify,
    handleAccountRecovery,
};
