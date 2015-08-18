/* global DB_PATH, Helper, DEBUG_MODE, App, module */

App.include('/server/libs/SQLite');
var db = new SQLite(App.getPath(DB_PATH));
db.debug = (DEBUG_MODE > 1);

var dateFormat = require('dateformat');

/**
 * Description
 * @return 
 */
Entities = function () {
};

/**
 * Description
 * @method model
 * @return 
 */
Entities.model = function () {

    var table = 'models';

    /**
     * Description
     * @method add
     * @param {} name
     * @param {} filename
     * @param {} description
     * @return 
     */
    this.add = function (name, filename, description) {
        var date = dateFormat(new Date(), 'yyyy-mm-dd h:MM:ss');
        db.insert(table, 'name, filename, description, date_uploaded', [name, filename, description, date]);
    };

    /**
     * Description
     * @method list
     * @param {} onSuccess
     * @param {} onError
     * @return 
     */
    this.list = function (onSuccess, onError) {
        db.select(table, null, onSuccess, onError);
    };

    /**
     * Description
     * @method delete
     * @param {} idModel
     * @param {} onSuccess
     * @param {} onError
     * @return 
     */
    this.delete = function (idModel, onSuccess, onError) {
        db.delete(table, {'id': idModel}, onSuccess, onError);
    };

};

Entities.instances = {};

/**
 * Description
 * @method getModel
 * @return MemberExpression
 */
Entities.getModel = function () {
    if (typeof Entities.instances.model !== 'object') {
        Entities.instances.model = new Entities.model();
    }
    return Entities.instances.model;
};

module.exports = Entities;