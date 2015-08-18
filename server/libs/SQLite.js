/* global require */

/**
 * Description
 * @param {} file
 * @return 
 */
SQLite = function (file) {

    var db;
    var self = this;
    this.debug = false;

    /**
     * Description
     * @method insert
     * @param {} table
     * @param {} fields
     * @param {} values
     * @param {} onSuccess
     * @param {} onError
     * @return 
     */
    this.insert = function (table, fields, values, onSuccess, onError) {
        try {
            var strFields = (fields) ? ' (' + fields + ')' : '';
            var strValues = getQueryValues(values);
            var query = 'INSERT INTO ' + table + strFields + ' VALUES(' + strValues + ')';
            debug(query);
            db.serialize(function () {
                var stmt = db.prepare(query);
                stmt['run'].apply(stmt, values);
                stmt.finalize();
            });
        } catch (err) {
            throw err;
        }
    };

    /**
     * Description
     * @method select
     * @param {} table
     * @param {} fields
     * @param {} onSuccess
     * @param {} onError
     * @return 
     */
    this.select = function (table, fields, onSuccess, onError) {
        try {
            var strFields = (fields) ? fields : '*';
            var query = 'SELECT ' + strFields + ' FROM ' + table;
            /**
             * Description
             * @method callback
             * @param {} error
             * @param {} result
             * @return 
             */
            var callback = function (error, result) {
                onCallback(query, onSuccess, onError, error, result);
            };
            debug(query);
            db.all(query, callback);
        } catch (err) {
            onError(err);
        }
    };

    /**
     * Description
     * @method selectWhere
     * @param {} table
     * @param {} fields
     * @param {} filters
     * @param {} onSuccess
     * @param {} onError
     * @return 
     */
    this.selectWhere = function (table, fields, filters, onSuccess, onError) {
    };

    /**
     * Description
     * @method delete
     * @param {} table
     * @param {} filters
     * @param {} onSuccess
     * @param {} onError
     * @return 
     */
    this.delete = function (table, filters, onSuccess, onError) {
        try {
            if (!filters || (filters.isArray && filters.length < 1)) {
                throw new Error('Delete method need at leats one filter');
            }
            var queryFilters = getQueryFilters(filters);
            var query = 'DELETE FROM ' + table + ' WHERE (' + queryFilters.where + ')';
            /**
             * Description
             * @method callback
             * @param {} error
             * @param {} result
             * @return 
             */
            var callback = function (error, result) {
                onCallback(query, onSuccess, onError, error, result);
            };
            debug(query);
            db.run(query, queryFilters.values, callback);
        } catch (err) {
            onError(err);
        }
    };

    /**
     * Description
     * @method onCallback
     * @param {} query
     * @param {} onSuccess
     * @param {} onError
     * @param {} error
     * @param {} result
     * @return 
     */
    var onCallback = function (query, onSuccess, onError, error, result) {
        if (error) {
            var errorMessage = (error && error.hasOwnProperty('message')) ? error.message : error;
            errorMessage += (' [query = ' + query + ']');
            onError(errorMessage);
        } else {
            onSuccess(result);
        }
    };

    /**
     * Description
     * @method getQueryFilters
     * @param {} filters
     * @return ObjectExpression
     */
    var getQueryFilters = function (filters) {
        var strFilters = '';
        var values = [];
        for (var filterKey in filters) {
            strFilters += (filterKey + ' = ? AND ');
            values.push(filters[filterKey]);
        }
        strFilters = strFilters.substring(0, strFilters.length - 5);
        return {'where': strFilters, 'values': values};
    };

    /**
     * Description
     * @method getQueryValues
     * @param {} values
     * @return strValues
     */
    var getQueryValues = function (values) {
        var strValues = '';
        for (var i = 0; i < values.length; ++i) {
            strValues += '?,';
        }
        strValues = strValues.substring(0, strValues.length - 1);
        return strValues;
    };

    /**
     * Description
     * @method getDB
     * @return db
     */
    this.getDB = function () {
        return db;
    };

    /**
     * Description
     * @method debug
     * @param {} message
     * @return 
     */
    var debug = function (message) {
        if (self.debug) {
            console.log('SQLite: ' + message);
        }
    };

    /**
     * Description
     * @method __construc
     * @return 
     */
    var __construc = function () {
        try {
            var sqlite3 = require('sqlite3').verbose();
            db = new sqlite3.Database(file);
        }
        catch (err) {
            throw err;
        }
    };

    __construc();

};