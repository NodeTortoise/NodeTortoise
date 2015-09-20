/* global App, Sockets, Helper, module, MASTER_PASSWORD, MODELS_PATH, TORTOISE_SET_SESSION_STRING  */

/**
 * Controla las sesiones de creadas por los usuarios para ejecutar las simulaciones.
 * @class SessionController
 * @constructor
 */
SessionController = function () {

    var self = this;
    var Sockets, Session;
    var sessions, sessionData;

    /**
     * Realiza el proceso de inicialización de variables necesarias por el objeto.
     * @method init
     */
    this.init = function () {
        sessions = {};
        sessionData = {};
    };

    /**
     * Añade un usuario a una sesión de simulación. Si la sessión no existe, crea una nueva.
     * @method joinSession
     * @param {String} sessionName El nombre de la sesión
     * @param {String} userName El nombre del usuario
     * @param {String} modelFile El archivo del modelo de la simulación que ejecutará la sesión
     * @param {String} modelName El nombre del modelo de la simulación que ejecutará la sesión
     * @param {Boolean} [enabledControls] Determinar si la sesión habilita o no los controles a otros usuarios distintos del maestro. Parámetro obligatorio solo para el usuario maestro.
     * @return {Object} Un objecto JavaScript estandar con la información sobre la sesión. 
     */
    this.joinSession = function (sessionName, userName, modelFile, modelName, enabledControls) {
        if (!sessions[sessionName]) {
            sessions[sessionName] = new Session(sessionName);
            sessions[sessionName].init();
            self.setSessionModel(sessionName, modelFile, modelName, userName);
            return sessions[sessionName].addUser(userName, MASTER_PASSWORD, enabledControls);
        } else {
            return sessions[sessionName].addUser(userName, null, null);
        }
    };

    /**
     * Elimina un usuario de una sesión de simulación. 
     * @method leaveSession
     * @param {String} sessionName El nombre de la sesión
     * @param {String} userName El nombre del usuario
     * @param {String} token El token de sesión del usuario
     * @return diedSession Indica si la sesión murió, porque el que abandonó fue el usuario maestro.
     */
    this.leaveSession = function (sessionName, userName, token) {
        var diedSession = false;
        if (sessions[sessionName]) {
            sessions[sessionName].removeUser(userName, token);
            if (!sessions[sessionName].isMasterOnline || self.getSessionUsersQuantity(sessionName) === 0) {
                delete sessions[sessionName];
                diedSession = true;
                App.debug('Died Session', sessionName, userName, 1);
            }
        }
        return diedSession;
    };

    /**
     * Establece el modelo a ejecutar en una sesión de simulación
     * @method setSessionModel
     * @param {String} sessionName El nombre de la sesion
     * @param {String} modelFile El archivo del modelo
     * @param {String} modelName El nombre del modelo
     * @param {String} masterName El nombre del usuario maestro
     */
    this.setSessionModel = function (sessionName, modelFile, modelName, masterName) {
        sessionData[sessionName] = {'file': modelFile, 'name': modelName, 'master': masterName};
    };

    /**
     * Devuelve el modelo que se está utilizando en una sesión.
     * @method getSessionModel
     * @param {String} sessionName El nombre de la sesión
     * @return {String} El nombre del modelo utilizado en la sesión
     */
    this.getSessionModel = function (sessionName) {
        return sessionData[sessionName].file;
    };

    /**
     * Retorna la lista de las sesiones de simulación activas.
     * @method getSessionList
     * @return {Array} La lista de sesiones
     */
    this.getSessionList = function () {
        return sessionData;
    };

    /**
     * Retorna una sesión, basado en el nombre recibido como parámetro.
     * @method getSession
     * @param {String} sessionName Nombre de la sesión
     * @return {Session} La sessión
     */
    this.getSession = function (sessionName) {
        return sessions[sessionName];
    };

    /**
     * Retorna la cantidad de usuarios en una sesión, basado en el nombre recibido como parámetro.
     * @method getSessionUsersQuantity
     * @param {String} sessionName El nombre de la sesión
     * @return {Integer} La cantidad de usuarios en la sesión
     */
    this.getSessionUsersQuantity = function (sessionName) {
        if (!sessions[sessionName]) {
            return 0;
        } else {
            return Object.keys(sessions[sessionName].users).length;
        }
    };
    
    /**
     * Constructor de la clase
     * @private
     * @method __construct
     */
    var __construct = function () {
        Sockets = App.require('/da/Sockets');
        Session = App.require('/bl/Session');
    };

    __construct();
};

/**
 * Basado en el patrón <i>Singleton</i>, returna una instancia del objeto SessionController
 * @method getInstance
 * @static
 * @return {SessionController}
 */
SessionController.getInstance = function () {
    if (typeof SessionController._instance_ !== 'object') {
        SessionController._instance_ = new SessionController();
    }
    return SessionController._instance_;
};

module.exports = SessionController;