const express = require('express');
const router = express.Router();
const fetch = require('node-fetch')


require('dotenv').config();

const imageStore = {
    codeforces: "https://cdn.iconscout.com/icon/free/png-256/free-code-forces-3521352-2944796.png",
    codechef: "https://cdn.codechef.com/sites/all/themes/abessive/cc-logo.png",
    atcoder: "https://i.namu.wiki/i/oloBJdRd29lBIF-mdv1FjWucpE3tGPhudDBTvOBChAT3A5w9zDUYg51mvn6NNOwoHJZIwxkVyzeXQMhtLAcQOQ.webp",
    geeksforgeeks: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/GeeksforGeeks.svg/1280px-GeeksforGeeks.svg.png",
    codingninjas: "https://files.codingninjas.in/cnlogo-32511.png",
    topcoder: "https://cdn.iconscout.com/icon/free/png-256/free-topcoder-3521765-2945263.png",
}

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


    const filteredInfo = info.filter(item => {
        return item.host.includes('codeforces.com') || item.host.includes('codechef.com')
    })


    const infoParsed = {}

    console.log(filteredInfo)
    // return infoParsed;
    return filteredInfo;
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
                // console.log('Api-Data : ', data);
                // res.send(data.map((info) => parseInfo(info)));

                const info = data.objects;

                const filteredInfo = info.filter(item => {
                    return item.host.includes('codeforces.com') || item.host.includes('codechef.com') || item.host.includes('codingninjas.com/codestudio') || item.host.includes('atcoder.jp') || item.host.includes('geeksforgeeks.org') || item.host.includes('topcoder.com')
                })

                const newData = filteredInfo.map(item => {
                    const host = item.host

                    switch (host) {
                        case 'codechef.com' :
                            return {
                                ...item,
                                logo: imageStore.codechef
                            }

                        case 'codeforces.com' :
                            return {
                                ...item,
                                logo: imageStore.codeforces
                            }

                        case 'codingninjas.com/codestudio' :
                            return {
                                ...item,
                                logo: imageStore.codingninjas
                            }

                        case 'atcoder.jp' :
                            return {
                                ...item,
                                logo: imageStore.atcoder
                            }

                        case 'geeksforgeeks.org' :
                            return {
                                ...item,
                                logo: imageStore.geeksforgeeks
                            }

                        case 'topcoder.com' :
                            return {
                                ...item,
                                logo: imageStore.topcoder
                            }

                        default :
                            item
                    }
                })


                res.send(newData);
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