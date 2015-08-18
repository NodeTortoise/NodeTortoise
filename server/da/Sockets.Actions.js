/* global Sockets, App, module */

var Sockets = App.require('/da/Sockets');
var SessionController = App.require('/bl/SessionController');

/**
 * Description
 * @method Actions
 * @return 
 */
Sockets.Actions = function () {
};

/**
 * Description
 * @method connect
 * @param {} socket
 * @param {} token
 * @param {} params
 * @return 
 */
Sockets.Actions.connect = function (socket, token, params) {
    var sessionName = params.session;
    var response = SessionController.getInstance().joinSession(sessionName, params.modelFile, params.name, params.controls);
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
 * Description
 * @method disconnect
 * @param {} socket
 * @param {} token
 * @param {} params
 * @return 
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
 * Description
 * @method executeCommand
 * @param {} socket
 * @param {} token
 * @param {} params
 * @return 
 */
Sockets.Actions.executeCommand = function (socket, token, params) {
    Sockets.sendAction(socket, socket.session, 'executeCommand', params);
};

/**
 * Description
 * @method setGlobal
 * @param {} socket
 * @param {} token
 * @param {} params
 * @return 
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
 * Description
 * @method updateSpeed
 * @param {} socket
 * @param {} token
 * @param {} params
 * @return 
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
 * Description
 * @method applyUpdate
 * @param {} socket
 * @param {} token
 * @param {} params
 * @return 
 */
Sockets.Actions.applyUpdate = function (socket, token, params) {
    Sockets.sendAction(socket, socket.session, 'applyUpdate', params);
};

/**
 * Description
 * @method sendMessage
 * @param {} socket
 * @param {} params
 * @return 
 */
Sockets.Actions.sendMessage = function (socket, params) {
    Sockets.sendAction(socket, socket.session, 'getMessage', params);
    App.debug('sendMessage', socket.session, socket.username, 2);
};

module.exports = Sockets.Actions;