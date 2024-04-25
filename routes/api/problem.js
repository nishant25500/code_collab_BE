const express = require("express");
const Problems = require("../../model/Problems");
const router = express.Router();
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const User = require("../../model/User");
const axios = require("axios");
require("dotenv").config();

router.get("/", async (req, res) => {
    try {
        const allProblems = await axios.get('https://codeforces.com/api/problemset.problems?tags=implementation')
        console.log('All Problems : ', allProblems.data)
        res.json({
            message: "All Problems",
            data: allProblems.data
        });
    } catch (err) {
        console.log('Error')
        res.send(`Error Occured : ${err}`)
    }
});

router.get("/:problemSlug", async (req, res) => {
    const {problemSlug} = req.params;
    const problem = await Problems.findOne({
        problem_slug: problemSlug,
    });
    if (problem) {
        res.json({
            problem: {
                problem_slug: problem.problem_slug,
                title: problem.title,
                description: problem.description,
                sampleInput: problem.sampleInput,
                sampleOutput: problem.sampleOutput,
                difficulty: problem.difficulty,
                tags: problem.tags,
                // testCasesInput: problem.testCasesInput,
            },
        });
    } else {
        res.status(404).send({error: "Problem not found"});
    }
});

router.post("/:problemSlug", async (req, res) => {
    const {problemSlug} = req.params;
    const problem = await Problems.findOne({
        problem_slug: problemSlug,
    });
    if (!problem) {
        return res.status(404).send({error: "Problem not found"});
    }
    const url = `https://glot.io/api/run/${
        req.body?.files[0]?.name?.split(".")[1]
    }/latest`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + "349f7681-2a94-4cb8-92f1-c9dac48a282c",
        },
        body: JSON.stringify({
            stdin: problem.testCasesInput,
            files: [
                {
                    name: req.body?.files[0]?.name,
                    content: req.body?.files[0]?.content,
                },
            ],
        }),
    });
    const resp = await response.json();
    if (resp.error || resp.stderr) {
        return res.status(400).send({error: resp.stderr || resp.error});
    }

    if (resp.stdout.trim() !== problem.testCasesOutput.trim()) {
        return res.status(400).send({error: "Wrong Answer"});
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

        const solvedObject = foundUser.problemSolved.find(prob => prob.problemSlug == problemSlug);
        if (solvedObject) {
            solvedObject.solvedDate = new Date();
        } else {
            foundUser.problemSolved.push({
                problemSlug,
                solvedDate: new Date(),
            });
        }
        await foundUser.save();
        return res.send({message: "Correct Answer"});
    });
});


module.exports = router;
