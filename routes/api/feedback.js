const express = require('express');
const nodemailer = require('nodemailer');
const Feedback = require('../../model/Feedback');
const router = express.Router();


router.post('/', async (req, res, next) => {
    try {
        const {email, message} = req.body;
        const newFeedback = new Feedback({
            email,
            message
        });

        console.log(newFeedback);

        const testAccount = await nodemailer.createTestAccount();


        const transporter = await nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
                user: process.env.FEEDBACK_EMAIL,
                pass: process.env.FEEDBACK_PASSWORD,
            },
        });

        // const mailOptions = {
        //     from: process.env.FEEDBACK_EMAIL,
        //     to: 'sudhanshuchaubey273@gmail.com',
        //     subject: `Sending Feedback related to CodeCollab : ${email}`,
        //     text: message
        // };

        // const result = await transporter.sendMail(mailOptions, function (error, info) {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log('Email sent: ' + info.response);
        //     }
        // });

        const info = await  transporter.sendMail({
            from: `Sudhanshu 👻 <${email}>`, // sender address
            to: "sudhanshuchaubey273@gmail.com", // list of receivers
            subject: "Feedback from CodeCollab", // Subject line
            text: message, // plain text body
            // html: "<b>Hello world?</b>", // html body
        })

        console.log(info);


        await newFeedback.save();
        res.status(201).json({
            message: 'Feedback send successfully'
        });
    } catch (err) {
        console.log('Error Occured ', err)
        res.send(err.message);

    }
});

module.exports = router;