/* global require */

/**
 * Ejecuta acciones sobre una base de SQLite
 * @class SQLite
 * @constructor
 * @param {String} file Ruta al archivo de sqlite
 */
SQLite = function (file) {

    var db;
    var self = this;
    this.debug = false;

    /**
     * Description
     * @method insert
     * @param {String} table La tabla sobre la cuál se ejecutará la acción
     * @param {String} fields Las columnas a insertar
     * @param {Array} values Los valores a insertar
     * @param {Function} onSuccess Función a ejecutar cuando el proceso en base de datos se completa exitosamente
     * @param {Funtion} onError Función a ejecutar en caso de error
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
     * Selecciona los registros de una tabla, basado en los filtros obtenidos
     * @method selectAll
     * @param {String} table La tabla sobre la cuál se ejecutará la acción
     * @param {Array} filters Los filtros de la consulta (<i>where</i>)
     * @param [String = '*'] fields Las columnas a seleccionar
     * @param {Function} onSuccess Función a ejecutar cuando el proceso en base de datos se completa exitosamente
     * @param {Funtion} onError Función a ejecutar en caso de error
     */
    this.select = function (table, filters, fields, onSuccess, onError) {
        try {
            var strFields = (fields) ? fields : '*';
            var queryFilters = getQueryFilters(filters);
            var query = 'SELECT ' + strFields + ' FROM ' + table + ' WHERE (' + queryFilters.where + ')';
            var callback = function (error, result) {
                onCallback(query, onSuccess, onError, error, result);
            };
            debug(query);
            db.all(query, queryFilters.values, callback);
        } catch (err) {
            onError(err);
        }
    };

    /**
     * Selecciona todos los registros de una tabla.
     * @method selectAll
     * @param {String} table La tabla sobre la cuál se ejecutará la acción
     * @param [String = '*'] fields Las columnas a seleccionar
     * @param {Function} onSuccess Función a ejecutar cuando el proceso en base de datos se completa exitosamente
     * @param {Funtion} onError Función a ejecutar en caso de error
     */
    this.selectAll = function (table, fields, onSuccess, onError) {
        try {
            var strFields = (fields) ? fields : '*';
            var query = 'SELECT ' + strFields + ' FROM ' + table;
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
     * Elimina uno o más registros de una tabla.
     * @method delete
     * @param {String} table La tabla sobre la cuál se ejecutará la acción
     * @param {Array} filters Los filtros de la consulta (<i>where</i>)
     * @param {Function} onSuccess Función a ejecutar cuando el proceso en base de datos se completa exitosamente
     * @param {Funtion} onError Función a ejecutar en caso de error
     * @return 
     */
    this.delete = function (table, filters, onSuccess, onError) {
        try {
            if (!filters || (filters.isArray && filters.length < 1)) {
                throw new Error('Delete method need at leats one filter');
            }
            var queryFilters = getQueryFilters(filters);
            var query = 'DELETE FROM ' + table + ' WHERE (' + queryFilters.where + ')';
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
     * Ejecuta el <i>callback</i> indicado después de realizar una tarea de base 
     * de datos, ya sea este de procesos exitoso o de error.
     * @method onCallback
     * @param {String} query La consulta previamente ejecutada
     * @param {Function} onSuccess Función a ejecutar cuando el proceso en base de datos se completa exitosamente
     * @param {Funtion} onError Función a ejecutar en caso de error
     * @param {mixed} error El error o mensaje de error
     * @param {mixed} result El resultado
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
     * Retorna los valores necesarios para armar una consulta parametrizada con 
     * <i>where</i>.
     * @method getQueryFilters
     * @private
     * @param {Array} filters
     * @return {Object} Objetos compuesto por <b>"where"</b> y <b>"values"</b> 
     * donde <b>"where"</b> contiene la información del <i>string</i> que se 
     * debe colocar en el lugar de los valores de filtro de la consulta y 
     * <b>"values"</b> contiene los valores a ser utilizados para la consulta
     * parametrizada.
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
     * Retorna los valores necesarios para armar una consulta parametrizada con 
     * <i>values</i> (ejemplo: ?, ?, ?).
     * @method getQueryValues
     * @private
     * @param {Array} values
     * @return {String} strValues El <i>string</i> que se debe colocar en el 
     * lugar de los valores de la consulta
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
     * Retorna la instancia de SQLite3 utilizada
     * @method getDB
     * @return {SQLite3} db Instancia de SQLite3 utilizada
     */
    this.getDB = function () {
        return db;
    };

    /**
     * Imprime en consola un mensaje de error, si el atributo debug del objeto 
     * es <i>true</i>.
     * @method debug
     * @param {String} message Mensaje de error
     */
    var debug = function (message) {
        if (self.debug) {
            console.log('SQLite: ' + message);
        }
    };

    /**
     * Constructor de la clase
     * @method __construct
     * @private
     */
    var __construct = function () {
        try {
            var sqlite3 = require('sqlite3').verbose();
            db = new sqlite3.Database(file);
        }
        catch (err) {
            throw err;
        }
    };

    __construct();

};