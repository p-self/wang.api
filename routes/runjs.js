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
    css: Sequelize.TEXT,
    js: Sequelize.TEXT,
    html: Sequelize.TEXT
});

/**
 * 将代码提交到远程并分配id
 */
router.post('/', function(req, res, next) {
    if(req.body.id){
        //更新
        Runjs.findOne({where: {id: req.body.id}}).then(runjs => {
            Object.keys(req.body).forEach(function (key) {
                runjs[key] = req.body[key];
            });
            runjs.save();
            res.json(runjs);
        })
    }else{
        //新增
        Runjs.sync({
            // force:true
        }).then(() => {
            Runjs.create(req.body).then(function (runjs) {
                res.json(runjs);
            })
        });
    }
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
        processHTML(runjs).then(function (html) {
            res.send(html)
        })
    })
});

function processHTML(runjs) {
    return new Promise(function (resolve) {
        const $ = require("cheerio").load(runjs.html, {
            xml: {
                withDomLvl1: true,
                normalizeWhitespace: false,
                xmlMode: false,
                decodeEntities: false
            }
        });

        console.log(runjs.html)

        //在head前面追加style
        $("head").append((`<style>${runjs.css}</style>`))

        //在body后面追加js
        $("body").append((`<script>${runjs.js}</script>`))

        resolve($.html());
    })
}

module.exports = router;
