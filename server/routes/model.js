/* global App, module, Controller */

var express = require('express');
var router = express.Router();

var Controller = App.require('/bl/Controller');

router.get('/upload', function (req, res) {
    Controller.model.upload(req, res);
});

router.post('/upload', function (req, res) {
    if (req.files.model === undefined) {
        Controller.message(req, res, 'Error al subir archivo', 'Archivo no seleccionado');
    } else if(req.custom_parameters_.success === true) {
        res.redirect('/model/upload/success');
    } else {
        res.redirect('/model/upload/error');
    }
});

router.get('/upload/success', function (req, res) {
    Controller.model.upload.success(req, res);
});

router.get('/upload/error', function (req, res) {
    Controller.model.upload.error(req, res);
});

router.get('/list', function (req, res, next) {
    Controller.model.list(req, res, next);
});

router.post('/delete/:filename', function (req, res) {
    Controller.model.delete(req, res);
});

module.exports = router;
