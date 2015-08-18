/* global App, Sockets, Helper, module, MASTER_PASSWORD, MODELS_PATH, TORTOISE_SET_SESSION_STRING  */

/**
 * Description
 * @return 
 */
SessionController = function () {

    var self = this;
    var Sockets, Session;
    var sessions, modelsBySession;

    /**
     * Description
     * @method init
     * @return 
     */
    this.init = function () {
        sessions = {};
        modelsBySession = {};
    };

    /**
     * Description
     * @method joinSession
     * @param {} sessionName
     * @param {} modelFile
     * @param {} userName
     * @param {} enabledControls
     * @return 
     */
    this.joinSession = function (sessionName, modelFile, userName, enabledControls) {
        if (!sessions[sessionName]) {
            sessions[sessionName] = new Session(sessionName);
            sessions[sessionName].init();
            modelsBySession[sessionName] = modelFile;
            return sessions[sessionName].addUser(userName, MASTER_PASSWORD, enabledControls);
        } else {
            return sessions[sessionName].addUser(userName, null, null);
        }
    };

    /**
     * Description
     * @method leaveSession
     * @param {} sessionName
     * @param {} userName
     * @param {} token
     * @return diedSession
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
     * Description
     * @method setSessionModel
     * @param {} sessionName
     * @param {} modelName
     * @return 
     */
    this.setSessionModel = function (sessionName, modelName) {
        modelsBySession[sessionName] = modelName;
    };

    /**
     * Description
     * @method getSessionModel
     * @param {} sessionName
     * @return MemberExpression
     */
    this.getSessionModel = function (sessionName) {
        return modelsBySession[sessionName];
    };

    /**
     * Description
     * @method getSessionList
     * @return modelsBySession
     */
    this.getSessionList = function () {
        return modelsBySession;
    };

    /**
     * Description
     * @method getSession
     * @param {} sessionName
     * @return MemberExpression
     */
    this.getSession = function (sessionName) {
        return sessions[sessionName];
    };

    /**
     * Description
     * @method getSessionUsersQuantity
     * @param {} sessionName
     * @return 
     */
    this.getSessionUsersQuantity = function (sessionName) {
        if (!sessions[sessionName]) {
            return 0;
        } else {
            return Object.keys(sessions[sessionName].users).length;
        }
    };
    
    /**
     * Description
     * @method __construct
     * @return 
     */
    var __construct = function () {
        Sockets = App.require('/da/Sockets');
        Session = App.require('/bl/Session');
    };

    __construct();
};

/**
 * Description
 * @method getInstance
 * @return MemberExpression
 */
SessionController.getInstance = function () {
    if (typeof SessionController._instance_ !== 'object') {
        SessionController._instance_ = new SessionController();
    }
    return SessionController._instance_;
};

module.exports = SessionController;