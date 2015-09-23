/* global App, Helper, MODELS_PATH, TORTOISE_SET_SESSION_STRING, module, MODELS_TEMPLATE */

/**
 * Controla las acciones que se pueden ejecutar sobre un modelo.
 * @class Model
 * @constructor
 * @module Server
 * @submodule Server-bl
 */
Model = function () {

    var Entities = App.require('/da/Entities');

    /**
     * Agregar un modelo al sistema.
     * @method add
     * @param {String} originalFile Ruta al archivo original subido
     * @param {String} modelName Nombre del modelo
     * @param {String} description Texto descriptivo del modelo
     * @return {Boolean} success Resultado de la adición del modelo.
     */
    this.add = function (originalFile, modelName, description) {
        var Entities = App.require('/da/Entities');
        var originalFilePath = Helper.replaceAll(originalFile.path, '\\', '/');
        var fileName = Helper.cleanFileName(modelName) + '_' + Date.now();
        var htmlNewFilePath = getHTMLFile(fileName);
        var jsNewFilePath = getJSFile(fileName);
        var fs = require('fs');
        var success = false;
        try {
            parse(originalFilePath, htmlNewFilePath, jsNewFilePath, fileName, modelName, fs);
            Entities.getModel().add(modelName, fileName, description);
            success = true;
        } catch (err) {
            App.debug(err, 'N/A', 'onModelUploaded', 2);
            tryDeleteFile(htmlNewFilePath, 'HTML Model File', fs);
            tryDeleteFile(jsNewFilePath, 'JS Model File', fs);
        } finally {
            tryDeleteFile(originalFilePath, 'Original Model File', fs);
        }
        return success;
    };

    /**
     * Obtiene un modelo por ID de modelo.
     * @method getByID
     * @param {Integer} idModel ID del modelo
     * @param {Function} onSuccess Función a ejecutar cuando se obtiene el modelo
     * @param {Function} onError Función a ejecutar en caso de error
     */
    this.getByID = function(idModel, onSuccess, onError){
        return Entities.getModel().getByFilename(idModel, onSuccess, onError);
    };
    
    /**
     * Obtiene un modelo por nombre de archivo.
     * @method getByFilename
     * @param {Integer} filename Nombre del archivo
     * @param {Function} onSuccess Función a ejecutar cuando se obtiene el modelo
     * @param {Function} onError Función a ejecutar en caso de error
     */
    this.getByFilename = function(filename, onSuccess, onError){
        return Entities.getModel().getByFilename(filename, onSuccess, onError);
    };

    
    /**
     * Retorna la lista de modelos disponibles en el sistema
     * @method list
     * @param {Function} onSuccess Función a ejecutar cuando se ha recuperado la lista de modelos del sistema
     * @param {Function} onError Función e ejecutar si hay un error al recuperar la lista de modelos del sistema
     */
    this.list = function (onSuccess, onError){
        Entities.getModel().list(onSuccess, onError);
    };

    /**
     * Elimina un modelo del sistema
     * @method delete
     * @param {Integer} idModel El ID del modelo
     * @param {String} filename Nombre de archivo del modelo (sin la ruta)
     * @param {Function} onSuccess Función a ejecutar cuando el modelo sea eliminado correctamente del sistema
     * @param {Function} onError Función e ejecutar si hay un error al eliminar un modelo del sistema
     */
    this.delete = function(idModel, filename, onSuccess, onError){
        /**
         * Función a ejecutar cuando el modelo sea eliminado correctamente de la base de datos
         * @method afterDeleteFromDB
         */
        var afterDeleteFromDB = function (){
            var fs = require('fs');
            var htmlFile = getHTMLFile(filename);
            var jsFile = getJSFile(filename);
            tryDeleteFile(htmlFile, 'HTML Model File', fs);
            tryDeleteFile(jsFile, 'JS Model File', fs);
            onSuccess();
        };
        Entities.getModel().delete(idModel, afterDeleteFromDB, onError);
    };

    /**
     * Retorna la ruta al archivo HTML de un modelo.
     * @method getHTMLFile
     * @private
     * @param {String} fileName Nombre del archivo de modelo a recuperar
     * @return {String} La ruta al archivo HTML de un modelo
     */
    var getHTMLFile = function (fileName){
        return App.getRootPath(MODELS_PATH + fileName + '.html');
    };
    
    /**
     * Retorna la ruta al archivo JavaScript de un modelo.
     * @method getJSFile
     * @private
     * @param {String} fileName Nombre del archivo de modelo a recuperar
     * @return {String} La ruta al archivo JavaScript de un modelo
     */
    var getJSFile = function (fileName){
        return App.getRootPath(MODELS_PATH + 'js/' + fileName + '.js');
    };

    /**
     * Intenta eliminar un archivo del sistema de archivo, si falla, envía un mensaje de depuración a la aplicación.
     * @method tryDeleteFile
     * @private
     * @param {String} filePath Ruta del archivo
     * @param {String} fileStrID Identificador del archivo a ser mostrado en el mensaje de depuración.
     * @param {fs} fs Objeto que controla el sistema de archivos
     * @return {Boolean} Resultado de eliminar el archivo
     */
    var tryDeleteFile = function (filePath, fileStrID, fs) {
        try {
            fs.unlinkSync(filePath);
            App.debug(fileStrID + ' successfully deleted', 'N/A', 'Model::tryDeleteFile', 2);
            return true;
        } catch (err) {
            App.debug('Error deleting ' + fileStrID + ': ' + filePath, 'N/A', 'Model::tryDeleteFile', 1);
            App.debug(err, 'N/A', 'Model::tryDeleteFile', 2);
            return false;
        }
    };

    /**
     * Procese un modelo exportado de Galapagos, para convertirlo al formato necesario para que funcione en NodeTortoise.
     * @method parse
     * @private
     * @param {String} originalFilePath Ruta del archivo original, subido al sistema
     * @param {String} htmlNewFilePath Ruta donde se debe guardar el archivo HTML del modelo
     * @param {String} jsNewFilePath Ruta donde se debe guardar el archivo JavaScript del modelo
     * @param {String} fileName Nombre del archivo del modelo
     * @param {String} modelName Nombre del modelo
     * @param {fs} fs Objeto que controla el sistema de archivos
     */
    var parse = function (originalFilePath, htmlNewFilePath, jsNewFilePath, fileName, modelName, fs) {
        var cheerio = require('cheerio');
        //--> Read files
        var htmlString = fs.readFileSync(originalFilePath, 'utf8').toString();
        var modelTemplate = fs.readFileSync(App.getPath(MODELS_TEMPLATE), 'utf8').toString();
        var $ = cheerio.load(htmlString);
        //--> Get elements
        var styleEle = $('style').text();
        var scriptEle = $('script').text();
        var contentEle = $('#model-container').html();
        //--> Parse elements
        var beforeSession = 'Simulation.create();';
        var newSetSessionStr = beforeSession + TORTOISE_SET_SESSION_STRING;
        scriptEle = scriptEle.replace(TORTOISE_SET_SESSION_STRING, newSetSessionStr);
        var jsFileInclude = '<script src="/simulation/js/' + fileName + '.js"></script>';
        //--> Insert new content
        var finalFileStr = modelTemplate;
        finalFileStr = finalFileStr.replace('<!--@ TITLE @-->', modelName);
        finalFileStr = finalFileStr.replace('<!--@ STYLE @-->', styleEle);
        finalFileStr = finalFileStr.replace('<!--@ CONTENT @-->', contentEle);
        finalFileStr = finalFileStr.replace('<!--@ SCRIPT @-->', jsFileInclude);
        //--> Write file
        fs.writeFileSync(htmlNewFilePath, finalFileStr);
        fs.writeFileSync(jsNewFilePath, scriptEle);
        App.debug('Model Parsed', 'N/A', 'Model.parse', 2);
    };

};

/**
 * Basado en el patrón <i>Singleton</i>, retorna una instancia del objeto Model
 * @method getInstance
 * @static
 * @return {Model} La instancia de Model
 */
Model.getInstance = function () {
    if (typeof Model._instance_ !== 'object') {
        Model._instance_ = new Model();
    }
    return Model._instance_;
};

module.exports = Model;