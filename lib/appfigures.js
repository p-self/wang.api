const request = require("request");

let sessionId = "onruomibo5orl0tsdp4lgmrv";
let st = "e9e2a4eb2e9e4054adb020cf7ade12d7";

function requestAppfigures(appid,cb) {
    request.post({
        url: "https://appfigures.com/handlers/ranks/reportjson.ashx",
        headers: {
            "Content-Type":"application/x-www-form-urlencoded",
            "Cookie":`_af_session=${sessionId};`,
        },
        json: true,
        form:{
            app:appid,
            mode:"public",
            start:"01/01/10",
            end:"08/11/17",
            countries:"CN",
            type:"dates",
            events:"true",
            st:st
        }
    }, (err, response, body) => {
        let result = [
            ['']
        ];

        body.categories.forEach(function (cat) {
            result[0].push(cat.Category.FullName)
        });

        body.convertedtimestamps.reverse().forEach(function (date) {
            result.push([
                date.replace(/,/ig,"")
            ])
        });

        body.data.forEach(function (cat) {
            cat.reverse().forEach(function (num,index) {
                result[index+1].push(num)
            })
        });


        cb(result.join("\n"))
    });
}

function searchAppfigures(key,cb) {
    request.get({
        url: `https://appfigures.com/api/products/search/${key}?count=25&page=1&storefronts=apple%3Aios&st=${st}`,
        headers: {
            // "Content-Type":"application/x-www-form-urlencoded",
            "Cookie":`_af_session=${sessionId};`,
        },
        json: true,
    }, (err, response, body) => {
        cb(body)
    });
}

module.exports={
    requestAppfigures,
    searchAppfigures
};