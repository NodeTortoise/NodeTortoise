/* global App, Helper, MODELS_PATH, TORTOISE_SET_SESSION_STRING, module, MODELS_TEMPLATE */

/**
 * Description
 * @return 
 */
Model = function () {

    var Entities = App.require('/da/Entities');

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

    this.delete = function(idModel, filename, onSuccess, onError){
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
    
    this.list = function (onSuccess, onError){
        Entities.getModel().list(onSuccess, onError);
    };

    var getHTMLFile = function (fileName){
        return App.getRootPath(MODELS_PATH + fileName + '.html');
    };
    
    var getJSFile = function (fileName){
        return App.getRootPath(MODELS_PATH + 'js/' + fileName + '.js');
    };

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

Model.getInstance = function () {
    if (typeof Model._instance_ !== 'object') {
        Model._instance_ = new Model();
    }
    return Model._instance_;
};

module.exports = Model;