/* global module */

var express = require('express');
var router = express.Router();

router.get('/ui', function (req, res, next) {
    res.render('simulation/layout.html', {'page': {'no_title': true}, 'data': {}});
});

module.exports = router;
