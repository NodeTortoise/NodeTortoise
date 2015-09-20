/* global module */

var express = require('express');
var router = express.Router();

router.get('/netlogo-web', function (req, res, next) {
    var page = {'title': 'Acerca de NetLogo-Web', 'content_title': 'Acerca de NetLogo-Web'};
    var data = {};
    res.render('info/netlogo-web.html', {'page': page, 'data': data});
});

router.get('/install-galapagos', function (req, res, next) {
    var page = {'title': 'Galapagos', 'content_title': 'Galapagos'};
    var data = {};
    res.render('info/install-galapagos.html', {'page': page, 'data': data});
});

router.get('/install-nodetortoise', function (req, res, next) {
    var page = {'title': 'NodeTortoise', 'content_title': 'NodeTortoise'};
    var data = {};
    res.render('info/install-nodetortoise.html', {'page': page, 'data': data});
});

module.exports = router;
