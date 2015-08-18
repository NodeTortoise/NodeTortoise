/* global App, module, Controller */

var express = require('express');
var router = express.Router();

var Controller = App.require('/bl/Controller');

router.get('/list', function (req, res) {
    Controller.session.list(req, res);
});

module.exports = router;
