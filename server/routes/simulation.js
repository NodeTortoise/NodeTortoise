/* global module, CONFIG */

var express = require('express');
var router = express.Router();

router.get('/ui', function (req, res, next) {
    res.render('simulation/layout.html', {'page': {'no_title': true}, 'data': {}, 'config': CONFIG});
});

module.exports = router;
