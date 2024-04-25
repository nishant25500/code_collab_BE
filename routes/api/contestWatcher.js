const express = require('express');
const router = express.Router();
const fetch = require('node-fetch')


require('dotenv').config();

const DurationInSecondsToString = (durationInSeconds) => {
    durationInSeconds = parseInt(durationInSeconds);
    const durationInMinutes = durationInSeconds / 60;
    const durationInHours = durationInMinutes / 60;
    const durationInDays = durationInHours / 24;
    const durationInWeeks = durationInDays / 7;
    const durationInMonths = durationInWeeks / 4;
    const durationInYears = durationInMonths / 12;
    if (durationInYears > 1) {
        return `${Math.floor(durationInYears)} years`;
    } else if (durationInMonths > 1) {
        return `${Math.floor(durationInMonths)} months`;
    } else if (durationInWeeks > 1) {
        return `${Math.floor(durationInWeeks)} weeks`;
    } else if (durationInDays > 1) {
        return `${Math.floor(durationInDays)} days`;
    } else if (durationInHours > 1) {
        return `${Math.floor(durationInHours)} hours`;
    } else if (durationInMinutes > 1) {
        return `${Math.floor(durationInMinutes)} minutes`;
    } else {
        return `${Math.floor(durationInSeconds)} seconds`;
    }
}
const parseInfo = (info) => {

    // console.log(info);


    const imageStore = {
        "CodeForces": "codeforces",
        "CodeForces::Gym": "codeforces_gym",
        "TopCoder": "top_coder",
        "AtCoder": "at_coder",
        "CS Academy": "cs_academy",
        "CodeChef": "code_chef",
        "HackerRank": "hacker_rank",
        "HackerEarth": "hacker_earth",
        "Kick Start": "kick_start",
        "LeetCode": "leet_code",
        "Toph": "toph",
    }
    // const infoParsed = {
    //     contest_name: info.name,
    //     site_name: info.site,
    //     duration: DurationInSecondsToString(info.duration),
    //     url: info.url,
    //     in_24_hours: info.in_24_hours.toLocaleLowerCase() === "yes" ? true : false,
    //     start_time: info.start_time,
    //     end_time: info.end_time,
    //     currently_running: new Date(Date.parse(info.start_time)) < new Date() && new Date() < new Date(Date.parse(info.end_time)),
    //     site_logo: process.env.NODE_ENV === "production" ? `${process.env.BACKEND_URL}/images/${imageStore[info.site]}.png` : `http://localhost:${process.env.PORT}/images/${imageStore[info.site]}.png`,
    // }

    const infoParsed = {}
    // return infoParsed;
    return info;
}


router.route('/').get((req, res, next) => {


    // const url = `https://kontests.net/api/v1/all`;
    const url = `https://clist.by/api/v4/contest/?username=sudhanshu_273&api_key=40c8e98f87d0dc5a365f4d7e9edcbcd8b942b2e1&format=json&order_by=-start`;
    const options = {
        method: 'GET'
    };
    fetch(url, options)
        .then(response => response.json())
        .then(data => {
                // res.send(data);
                console.log('Api-Data : ', data);
                // res.send(data.map((info) => parseInfo(info)));
                res.send(data.objects);
            }
        )
        .catch(error => {
                console.log(error);
                res.status(500).send(error);
            }
        )
});


router.route('/:site').get((req, res, next) => {
    const {site} = req.params;
    const url = `https://kontests.net/api/v1/${site}`;
    const options = {
        method: 'GET'
    };
    fetch(url, options)
        .then(response => response.json())
        .then(data => {
                res.send(data.map((info) => parseInfo(info)).map(info => {
                    info.site_logo = process.env.NODE_ENV === "production" ? `${process.env.BACKEND_URL}/images/${site}.png` : `http://localhost:${process.env.PORT}/images/${site}.png`
                    return info;
                }));
            }
        )
        .catch(error => {
                console.log(error);
                res.status(500).send(error);
            }
        )
});
module.exports = router;