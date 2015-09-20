/* global Sockets, App, module */

var Sockets = App.require('/da/Sockets');
var SessionController = App.require('/bl/SessionController');

/**
 * Maneja las acciones a ejecutar entre las simulacione, cuya comunicación es 
 * vía web sockets.
 * @class Sockets.Actions
 */
Sockets.Actions = function () {
};

/**
 * Conecta una nueva instancia a una sesión de simulacón
 * @method connect
 * @static
 * @param {Socket} socket El web socket para la instancia actual
 * @param {String} token Token del usuario
 * @param {Object} params Parámetros de la acción
 */
Sockets.Actions.connect = function (socket, token, params) {
    var sessionName = params.session;
    var response = SessionController.getInstance().joinSession(sessionName, params.name, params.modelFile, params.modelName, params.controls);
    socket.username = response.name;
    socket.token = response.token;
    socket.master = response.master;
    socket.session = params.session;
    socket.join(sessionName);
    Sockets.sendToAll(socket.session, 'updateUsers', {'users': response.users});
    Sockets.sendToMe(socket, 'connect_Response', response);
    if (response.master) {
        Sockets.sendToAll(socket.session, 'start', response.controls);
        App.debug('start', socket.session, socket.username, 2);
    }
    App.debug('connect', socket.session, socket.username, 3);
};

/**
 * Desconecta al dueño dle socket actual de una sesión.
 * @method disconnect
 * @param {Socket} socket El web socket para la instancia actual
 * @param {String} token Token del usuario
 * @param {Object} params Parámetros de la acción
 */
Sockets.Actions.disconnect = function (socket, token, params) {
    var diedSession = SessionController.getInstance().leaveSession(socket.session, socket.username, socket.token);
    if (diedSession) {
        Sockets.sendToAll(socket.session, 'end');
        App.debug('end', socket.session, socket.username, 2);
    }
    socket.leave(socket.session);
    var session = SessionController.getInstance().getSession(socket.session);
    var currentUsers = session ? session.users : '';
    Sockets.sendToAll(socket.session, 'updateUsers', {'users': currentUsers});
    App.debug('disconnect', socket.session, socket.username, 3);
};

/**
 * Envía un mensaje de <b>Ejecutar Comando</b>, para que los 
 * clientes ejecuten un comando, basado en los parámetros enviados.
 * @method executeCommand
 * @param {Socket} socket El web socket para la instancia actual
 * @param {String} token Token del usuario
 * @param {Object} params Parámetros de la acción
 */
Sockets.Actions.executeCommand = function (socket, token, params) {
    Sockets.sendAction(socket, socket.session, 'executeCommand', params);
};

/**
 * Envía un mensaje de <b>Establecer valor de variable global</b>, para que los 
 * clientes establezcan un nuevo valor de variable global, basado en los 
 * parámetros enviados.
 * @method setGlobal
 * @param {Socket} socket El web socket para la instancia actual
 * @param {String} token Token del usuario
 * @param {Object} params Parámetros de la acción
 */
Sockets.Actions.setGlobal = function (socket, token, params) {
    if (SessionController.getInstance().getSession(socket.session).enabledControls) {
        Sockets.sendToOthers(socket, socket.session, 'setGlobal', params);
        App.debug('setGlobal', socket.session, socket.username, 2);
    } else {
        Sockets.sendAction(socket, socket.session, 'setGlobal', params);
    }
};

/**
 * Envía un mensaje de <b>Actualizar Velocidad</b>, para que los clientes 
 * ejecuten una actualización de la velocidad de la  simulación, 
 * basado en los parámetros enviados.
 * @method updateSpeed
 * @param {Socket} socket El web socket para la instancia actual
 * @param {String} token Token del usuario
 * @param {Object} params Parámetros de la acción
 */
Sockets.Actions.updateSpeed = function (socket, token, params) {
    if (SessionController.getInstance().getSession(socket.session).enabledControls) {
        Sockets.sendToOthers(socket, socket.session, 'updateSpeed', params);
        App.debug('updateSpeed', socket.session, socket.username, 2);
    } else {
        Sockets.sendAction(socket, socket.session, 'updateSpeed', params);
    }
};

/**
 * Envía un mensaje de <b>Aplicar actualización</b>, para que los clientes 
 * ejecuten una actualización de la simulación, basado en los parámetros enviados.
 * @method applyUpdate
 * @param {Socket} socket El web socket para la instancia actual
 * @param {String} token Token del usuario
 * @param {Object} params Parámetros de la acción
 */
Sockets.Actions.applyUpdate = function (socket, token, params) {
    Sockets.sendAction(socket, socket.session, 'applyUpdate', params);
};

/**
 * Envía un mensaje de <b>Enviar Mensaje</b>
 * @method sendMessage
 * @param {Socket} socket El web socket para la instancia actual
 * @param {Object} params Parámetros de la acción
 */
Sockets.Actions.sendMessage = function (socket, params) {
    Sockets.sendAction(socket, socket.session, 'getMessage', params);
    App.debug('sendMessage', socket.session, socket.username, 2);
};

module.exports = Sockets.Actions;