/* global app, MAIN_BROWSER, DEBUG, Helper, ModelActions, server, App, module, require, Model */

/**
 * Inicializa y configura los web sockets que se utilizan para el envío de la 
 * información en el ambiente de simulación de los modelos.
 * @class Sockets
 * @module Server
 * @submodule Server-da
 */
Sockets = function () {
};

/**
 * Instancia de sockets.io
 * @attribute io
 * @type {sockets.io}
 * @static
 */
Sockets.io = null;

/**
 * Envía a los demás la indicación de que se ejecute una acción.
 * @method sendAction
 * @static
 * @param {Socket} socket El web socket para la instancia actual
 * @param {String} sessionName Nombre de la sesión de simulación a la cual se va a enviar el mensaje
 * @param {String} action Acción a ejecutar
 * @param {Object} params Parámetros de la acción
 */
Sockets.sendAction = function (socket, sessionName, action, params) {
    var SessionController = App.require('/bl/SessionController');
    if (socket.token === SessionController.getInstance().getSession(sessionName).getMasterToken()) {
        Sockets.sendToOthers(socket, sessionName, action, params);
        App.debug(action, socket.username, null, 2);
    } else {
        App.debug('DENIED:', action, socket.username, 1);
    }
};

/**
 * Alias de Sockets.setServerActions
 * @method set
 * @param {Socket} socket El web socket para la instancia actual
 */
Sockets.set = function (socket) {
    Sockets.setServerActions(socket);
};

/**
 * Configura las acciones que se pueden ejecutar sobre el socket actual
 * @method setServerActions
 * @static
 * @param {Socket} socket El web socket para la instancia actual
 */
Sockets.setServerActions = function (socket) {
    var ModelActions = App.require('/bl/Model.Actions');
    socket.on('disconnect', function () {
        ModelActions.disconnect(socket);
    });
    for (var action in ModelActions) {
        (function (action) {
            var actionName = action + '__fromClient';
            socket.on(actionName, function (token, params) {
                ModelActions[action](socket, token, params);
            });
        })(action);
    }
};

/**
 * Envía un mensaje al dueño del socket actual
 * @method sendToMe
 * @static
 * @param {Socket} socket El web socket para la instancia actual
 * @param {String} action Acción a ejecutar
 * @param {Object} params Parámetros de la acción
 */
Sockets.sendToMe = function (socket, action, params) {
    action += '__fromServer';
    socket.emit(action, params);
};

/**
 * Envía un mensaje de acción a los otros usuarios dentro de la sesión del dueño del socket actual.
 * @method sendToOthers
 * @static
 * @param {Socket} socket El web socket para la instancia actual
 * @param {String} sessionName Nombre de la sesión
 * @param {String} action Acción a ejecutar
 * @param {Object} params Parámetros de la acción
 */
Sockets.sendToOthers = function (socket, sessionName, action, params) {
    action += '__fromServer';
    socket.broadcast.to(sessionName).emit(action, params);
};

/**
 * Envía un mensaje de acción a todos los usuarios dentro la sesión del dueño del socket actual.
 * @method sendToAll
 * @static
 * @param {String} sessionName Nombre de la sesión
 * @param {String} action Acción a ejecutar
 * @param {Object} params Parámetros de la acción
 */
Sockets.sendToAll = function (sessionName, action, params) {
    action += '__fromServer';
    Sockets.io.sockets.in(sessionName).emit(action, params);
};

/**
 * Configura la funcionalidad de los Sockets
 * @method init
 * @static
 * @param {http.Server} server Instancia del servidot HTTP
 */
Sockets.init = function (server) {
    Sockets.io = require('socket.io').listen(server, {log: false});
    Sockets.io.sockets.on('connection', function (socket) {
        Sockets.set(socket);
    });
};

module.exports = Sockets;