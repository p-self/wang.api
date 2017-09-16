
var express = require('express');
var router = express.Router();
const appFigures = require("./appfigures/appfigures")

/* GET users listing. */
router.get('/search', function(req, res, next) {
    appFigures.searchAppfigures(req.query,function (figures) {
        res.json(figures)
    })
});

router.get('/download', function(req, res, next) {
    appFigures.requestAppfigures(req.query,function (figures) {
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename='+require('urlencode')(req.query.appname)+'.csv'
        });
        var Readable = require('stream').Readable;
        var s = new Readable();
        s._read = function noop() {}; // redundant? see update below
        s.push(figures);
        s.push(null);
        s.pipe(res)

    })
});

router.post('/appannie', function(req, res, next) {
    require("request").get({
        url: `https://www.appannie.com/apps/ios/app/${req.body.app}/details/`,
        headers: {
            'user-agent':'Mozilla',
            'authority':' www.appannie.com',
            "cookie":`${decodeURIComponent(req.body.cookie)}`,
            'Content-Type':'text/html;charset=utf-8'
        },
    }, (err, response, body) => {
        const $ = require("cheerio").load(body, {
            xml: {
                normalizeWhitespace: true,
            }
        });

        let ret = [];

        $(".app_content_section.app-version-block h5").each(function (i,o) {

            let version = /(\d+\.\d+\.\d+)\s*\(([^\(\)]*)\)/ig.exec($(o).text());

            if(version){
                ret.push([
                    version[1],version[2],$(o).next("div").text()
                ])
            }
        });

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename='+require('urlencode')(req.body.app)+'.csv'
        });
        let Readable = require('stream').Readable;
        let s = new Readable();
        s._read = function noop() {}; // redundant? see update below
        s.push(ret.join("\n"));
        s.push(null);
        s.pipe(res)
    });
});

module.exports = router;
