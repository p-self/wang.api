
var express = require('express');
var router = express.Router();
const appFigures = require("../lib/appfigures")

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


module.exports = router;
