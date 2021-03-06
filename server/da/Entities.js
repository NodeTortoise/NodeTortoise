/* global DB_PATH, Helper, App, module, CONFIG */

App.include('/server/libs/SQLite');
var db = new SQLite(App.getPath(DB_PATH));
db.debug = (CONFIG.DEBUG_MODE > 1);

var dateFormat = require('dateformat');

/**
 * Maneja la relación de las distintas entidades con la base de datos.
 * @class Entities
 * @module Server
 * @submodule Server-da
 */
Entities = function () {
};

/**
 * Maneja la relación de la entidad <i>model</i> con la base de datos.
 * @class Entities.model
 */
Entities.model = function () {

    var table = 'models';

    /**
     * Inserta un modelo en base de datos.
     * @method add
     * @param {String} name Nombre del modelo
     * @param {String} filename Nombre del archivo del modelo sin extensión
     * @param {String} description Descripción del modelo
     * @return 
     */
    this.add = function (name, filename, description) {
        var date = dateFormat(new Date(), 'yyyy-mm-dd h:MM:ss');
        db.insert(table, 'name, filename, description, date_uploaded', [name, filename, description, date]);
    };

    /**
     * Obtiene un modelo por ID de modelo.
     * @method getByID
     * @param {Integer} idModel ID del modelo
     * @param {Function} onSuccess Función a ejecutar cuando se obtiene el modelo
     * @param {Function} onError Función a ejecutar en caso de error
     */
    this.getByID = function(idModel, onSuccess, onError){
        db.selectAll(table, {'id': idModel}, onSuccess, onError);
    };
    
    /**
     * Obtiene un modelo por nombre de archivo.
     * @method getByFilename
     * @param {Integer} filename Nombre del archivo
     * @param {Function} onSuccess Función a ejecutar cuando se obtiene el modelo
     * @param {Function} onError Función a ejecutar en caso de error
     */
    this.getByFilename = function(filename, onSuccess, onError){
        db.selectAll(table, {'filename': filename}, null, onSuccess, onError);
    };

    /**
     * Obtiene la lista de modelos en base de datos.
     * @method list
     * @param {Function} onSuccess Función a ejecutar cuando se obtiene la lista de modelos
     * @param {Function} onError Función a ejecutar en caso de error
     */
    this.list = function (onSuccess, onError) {
        db.selectAll(table, null, onSuccess, onError);
    };

    /**
     * Elimina un modelo de base de datos.
     * @method delete
     * @param {Integer} idModel ID del modelo
     * @param {Function} onSuccess Función a ejecutar cuando se elimina el modelo
     * @param {Function} onError Función a ejecutar en caso de error
     * @return 
     */
    this.delete = function (idModel, onSuccess, onError) {
        db.delete(table, {'id': idModel}, onSuccess, onError);
    };

};

Entities.instances = {};

/**
 * Basado en el patrón <i>Singleton</i>, retorna una instancia del objeto Entities.model
 * @method getInstance
 * @return {Entities.model}
 */
Entities.getModel = function () {
    if (typeof Entities.instances.model !== 'object') {
        Entities.instances.model = new Entities.model();
    }
    return Entities.instances.model;
};

module.exports = Entities;