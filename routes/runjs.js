const express = require('express');
const router = express.Router();
const config = require("../config");
const Sequelize = require("sequelize")

const sequelize = new Sequelize(config.db, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

const Runjs = sequelize.define('runjs', {
    css: Sequelize.STRING,
    js: Sequelize.STRING,
    html: Sequelize.STRING,
    show_code:Sequelize.STRING,//兼容原来的runjs
});

/**
 * 将代码提交到远程并分配id
 */
router.post('/', function(req, res, next) {
    const js = req.body.js,
        css = req.body.css,
        html = req.body.html,
        show_code = req.body.show_code,
        id = req.body.id;
    if(id){
        //更新
        Runjs.findOne({where: {id: id}}).then(runjs => {
            if (css) {
                runjs.css = css;
            }
            if (html) {
                runjs.html = html;
            }
            if (js) {
                runjs.js = js;
            }
            if (show_code) {
                runjs.show_code = show_code;
            }

            runjs.save();
        })
    }else{
        //新增
        Runjs.sync({
            force:true
        }).then(() => {
            Runjs.create({
                js,
                html,
                css
            })
        });
    }

    res.send('respond with a resource');
});

/**
 * 按照id查询代码
 */
router.get('/:id', function(req, res, next) {
    Runjs.findOne({ where: { id: req.params.id } }).then(runjs => {
        res.json(runjs)
    })
});

/**
 * 按照id查询代码,展示模式
 */
router.get('/view/:id', function(req, res, next) {
    Runjs.findOne({ where: { id: req.params.id } }).then(runjs => {
        const $ = require("cheerio").load(runjs.html, {
            xml: {
                normalizeWhitespace: true,
            }
        });

        //在head前面追加style
        $("head").append($(`<style>${runjs.css}</style>`))

        //在body后面追加js
        $("body").append($(`<script>${runjs.js}</script>`))

        res.send($.html());
    })
});

router.get('/show/:show_code', function(req, res, next) {
    Runjs.findOne({ where: { show_code: req.params.show_code } }).then(runjs => {
        const $ = require("cheerio").load(runjs.html, {
            xml: {
                normalizeWhitespace: true,
            }
        });

        //在head前面追加style
        $("head").append($(`<style>${runjs.css}</style>`))

        //在body后面追加js
        $("body").append($(`<script>${runjs.js}</script>`))

        res.send($.html());
    })
});

module.exports = router;
