/* global module */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    var page = {'title': 'Inicio', 'content_title': 'Acerca de NodeTortoise'};
    var data = {};
    res.render('index.html', {'page': page, 'data': data});
});

module.exports = router;
