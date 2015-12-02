/* global module, CONFIG */

var express = require('express');
var router = express.Router();

router.get('/netlogo-web', function (req, res, next) {
    var page = {'title': 'Acerca de NetLogo-Web', 'content_title': 'Acerca de NetLogo-Web'};
    var data = {};
    res.render('info/netlogo-web.html', {'page': page, 'data': data, 'config': CONFIG});
});

router.get('/install-galapagos', function (req, res, next) {
    var page = {'title': 'Galapagos', 'content_title': 'Galapagos'};
    var data = {};
    res.render('info/install-galapagos.html', {'page': page, 'data': data, 'config': CONFIG});
});

router.get('/install-nodetortoise', function (req, res, next) {
    var page = {'title': 'NodeTortoise', 'content_title': 'NodeTortoise'};
    var data = {};
    res.render('info/install-nodetortoise.html', {'page': page, 'data': data, 'config': CONFIG});
});

router.get('/help/download-model', function (req, res, next) {
    var page = {'title': 'Descargar un modelo desde Galapagos', 'content_title': 'Descargar un modelo desde Galapagos'};
    var data = {};
    res.render('info/help/download-model.html', {'page': page, 'data': data, 'config': CONFIG});
});

router.get('/help/upload-model', function (req, res, next) {
    var page = {'title': 'Importar un modelo', 'content_title': 'Importar un modelo'};
    var data = {};
    res.render('info/help/upload-model.html', {'page': page, 'data': data, 'config': CONFIG});
});

router.get('/help/list-models', function (req, res, next) {
    var page = {'title': 'Listar los modelos disponibles', 'content_title': 'Listar los modelos disponibles'};
    var data = {};
    res.render('info/help/list-models.html', {'page': page, 'data': data, 'config': CONFIG});
});

router.get('/help/delete-model', function (req, res, next) {
    var page = {'title': 'Eliminar un modelo', 'content_title': 'Eliminar un modelo'};
    var data = {};
    res.render('info/help/delete-model.html', {'page': page, 'data': data, 'config': CONFIG});
});

router.get('/help/create-session', function (req, res, next) {
    var page = {'title': 'Crear una nueva sesión de simulación', 'content_title': 'Crear una nueva sesión de simulación'};
    var data = {};
    res.render('info/help/create-session.html', {'page': page, 'data': data, 'config': CONFIG});
});

router.get('/help/join-session', function (req, res, next) {
    var page = {'title': 'Unirse a una sesión de simulación existente', 'content_title': 'Unirse a una sesión de simulación existente'};
    var data = {};
    res.render('info/help/join-session.html', {'page': page, 'data': data, 'config': CONFIG});
});

module.exports = router;
