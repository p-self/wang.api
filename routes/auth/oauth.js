
const express = require('express');
const router = express.Router();
const request = require("request");
const config  = require("../../config");

/**
 * github的oauth认证
 */
router.get('/github', function(req, res, next) {
    request.post({
        url: `https://github.com/login/oauth/access_token`,
        form:{
            client_id:config.client_id,
            client_secret:config.client_secret,
            code:req.query.code
        },
        json: true,
    },(err, response, body) => {
        res.json(body)
    })
});

module.exports = router;