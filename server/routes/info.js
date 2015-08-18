/* global module */

var express = require('express');
var router = express.Router();

router.get('/netlogo-web', function (req, res, next) {
    var page = {'title': 'Acerca de NetLogo-Web', 'content_title': 'Acerca de NetLogo-Web'};
    var data = {};
    res.render('info/netlogo-web.html', {'page': page, 'data': data});
});

module.exports = router;
