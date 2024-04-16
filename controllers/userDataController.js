const jwt = require('jsonwebtoken');
require('dotenv').config();

const getUserData = (req, res, next) => {
    const token = req?.cookies?.jwt_access;

    // const authHeader = req.headers.authorization || req.headers.Authorization;
    // if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    // // const token = authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            // req.user = decoded.UserInfo.username;
            // req.roles = decoded.UserInfo.roles;
            res.status(200).json({
                username : decoded.UserInfo.username,
                roles : decoded.UserInfo.roles,
                accessToken : token,
                name: decoded.UserInfo.name,
                email: decoded.UserInfo.email,
                picture: decoded.UserInfo.picture,
                isAccountVerified: decoded.UserInfo.isAccountVerified,
                problemSolved: decoded.UserInfo.problemSolved,
            });
        }
    );
}

module.exports = { getUserData };