/* global App, Sockets, Helper, module */

/**
 * Description
 * @param {} name
 * @return 
 */
Session = function (name) {

    var self = this;
    this.name = name;
    this.master = null;
    this.users = null;
    this.isMasterOnline = false;
    this.enabledControls = false;

    /**
     * Description
     * @method init
     * @return 
     */
    this.init = function () {
        self.users = {};
    };

    /**
     * Description
     * @method addUser
     * @param {} username
     * @param {} masterPassword
     * @param {} enabledControls
     * @return ObjectExpression
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
     * Description
     * @method removeUser
     * @param {} username
     * @param {} token
     * @return 
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
     * Description
     * @method getMasterToken
     * @return ConditionalExpression
     */
    this.getMasterToken = function () {
        return (self.master === null) ? null : self.master.token;
    };

};

module.exports = Session;