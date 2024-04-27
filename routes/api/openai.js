const {Configuration, OpenAIApi, openai} = require("openai");
const express = require("express")
const axios = require("axios");
const router = express.Router();
const {GoogleGenerativeAI} = require("@google/generative-ai");
require("dotenv").config();

router.get("/", async (req, res) => {
    try {

        const {message} = req.body

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        const model = genAI.getGenerativeModel({model: "gemini-pro"});

        const result = await model.generateContent(message)

        const response = result.response
        const text = response.text();
        console.log(text);

        res.json({
            status: true,
            data: text
        })


    } catch (err) {
        console.log(err)
        res.json({
            message: 'Error Occurred',
            data: err
        })
    }
})

module.exports = router;