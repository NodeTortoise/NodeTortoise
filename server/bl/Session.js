/* global App, Sockets, Helper, module */

/**
 * Maneja una sesión individual de una simulación.
 * @class Session
 * @constructor
 * @module Server
 * @submodule Server-bl
 * @param {String} name El nombre de la sesión
 */
Session = function (name) {

    var self = this;
    this.name = name;
    this.master = null;
    this.users = null;
    this.isMasterOnline = false;
    this.enabledControls = false;

    var sessionInfo = null;

    /**
     * Realiza el proceso de inicialización de variables necesarias por el objeto.
     * @method init
     * @param {String} modelFile El archivo del modelo
     * @param {String} modelName El nombre del modelo
     * @param {String} masterName El nombre del usuario maestro
     */
    this.init = function (modelFile, modelName, masterName) {
        self.users = {};
        sessionInfo = {
            'name': name, 'model': modelName, 'file': modelFile, 'master': masterName, 
            'firstActivity': new Date(), 'lastActivity': new Date()
        };
    };

    /**
     * Agrega un usuario a la sesión.
     * @method addUser
     * @param {String} username
     * @param {String} masterPassword
     * @param {Boolean} enabledControls
     * @return {Object} Un objecto JavaScript estandar con la información sobre la sesión.
     */
    this.addUser = function (username, masterPassword, enabledControls) {
        if (self.users[username] === username) {
            username += ('_' + Date.now());
        }
        var isMaster = false;
        var token = Helper.getHash(username, true);
        if (App.isUserMaster(masterPassword)) {
            isMaster = true;
            self.isMasterOnline = true;
            token = Helper.getHash(token, true);
            self.master = {'name': username, 'token': token};
            self.enabledControls = enabledControls;
            self.users[username] = username + ' (master)';
        } else {
            self.users[username] = username;
        }
        if (self.master === null) {
            self.isMasterOnline = false;
        }
        var canStart = self.isMasterOnline;
        return {'token': token, 'master': isMaster, 'name': username, 'controls': self.enabledControls, 'start': canStart, 'users': self.users};
    };

    /**
     * Elimina un usuario de una sesión de simulación.
     * @method removeUser
     * @param {String} userName El nombre del usuario
     * @param {String} token El token de sesión del usuario
     */
    this.removeUser = function (username, token) {
        if (self.master && self.master.token === token) {
            self.enabledControls = false;
            self.master = null;
        }
        if (self.master === null) {
            self.isMasterOnline = false;
        }
        delete self.users[username];
    };

    /**
     * Retorna el token del usuario maestro.
     * @method getMasterToken
     * @return {String} El token del usuario maestro
     */
    this.getMasterToken = function () {
        return (self.master === null) ? null : self.master.token;
    };

    /**
     * Actualiza la fecha de ultima actividad.
     * @method updateLastActivityDate
     */
    this.updateLastActivityDate = function () {
        sessionInfo.lastActivity = new Date();
    };

    /**
     * Retorna la información de la sesión.
     * @method getSessionInfo
     * @return {Object} Objeto estándar de NodeJS que contiene la información 
     * de la sesión
     */
    this.getSessionInfo = function () {
        return sessionInfo;
    };
    
    /**
     * Retorna la cantidad de usuarios en una sesión.
     * @method getUsersQuantity
     * @return {Integer} La cantidad de usuarios en la sesión
     */
    this.getUsersQuantity = function () {
        return (Object.keys(self.users).length);
    };

};

module.exports = Session;