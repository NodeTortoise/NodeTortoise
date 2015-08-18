/* global app, MAIN_BROWSER, DEBUG, Helper, Sockets.Actions, server, App, module, require */

/**
 * Description
 * @return 
 */
Sockets = function () {
};

Sockets.io = null;

/**
 * Description
 * @method sendAction
 * @param {} socket
 * @param {} sessionName
 * @param {} action
 * @param {} params
 * @return 
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
 * Description
 * @method set
 * @param {} socket
 * @return 
 */
Sockets.set = function (socket) {
    Sockets.setServerActions(socket);
};

/**
 * Description
 * @method setServerActions
 * @param {} socket
 * @return 
 */
Sockets.setServerActions = function (socket) {
    Sockets.Actions = App.require('/da/Sockets.Actions');
    socket.on('disconnect', function () {
        Sockets.Actions.disconnect(socket);
    });
    for (var action in Sockets.Actions) {
        (function (action) {
            var actionName = action + '__fromClient';
            socket.on(actionName, function (token, params) {
                Sockets.Actions[action](socket, token, params);
            });
        })(action);
    }
};

/**
 * Description
 * @method sendToMe
 * @param {} socket
 * @param {} action
 * @param {} params
 * @return 
 */
Sockets.sendToMe = function (socket, action, params) {
    action += '__fromServer';
    socket.emit(action, params);
};

/**
 * Description
 * @method sendToOthers
 * @param {} socket
 * @param {} sessionName
 * @param {} action
 * @param {} params
 * @return 
 */
Sockets.sendToOthers = function (socket, sessionName, action, params) {
    action += '__fromServer';
    socket.broadcast.to(sessionName).emit(action, params);
};

/**
 * Description
 * @method sendToAll
 * @param {} sessionName
 * @param {} action
 * @param {} params
 * @return 
 */
Sockets.sendToAll = function (sessionName, action, params) {
    action += '__fromServer';
    Sockets.io.sockets.in(sessionName).emit(action, params);
};

/**
 * Description
 * @method init
 * @param {} server
 * @return 
 */
Sockets.init = function (server) {
    Sockets.io = require('socket.io').listen(server, {log: false});
    Sockets.io.sockets.on('connection', function (socket) {
        Sockets.set(socket);
    });
};

module.exports = Sockets;