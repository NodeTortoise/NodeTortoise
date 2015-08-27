/* global __dirname, module, ROOT_DIR, DEBUG_MODE, MASTER_PASSWORD, TEMP_PATH, LIBS_PATH */

/**
 * Controlador principal de la aplicación en el lado del servidor. Se encarga de 
 * establecer los parámetros de configuración, configurando el framework Express, 
 * las rutas y el motor de plantillas (templates).
 * @class App
 * @return 
 */
App = function () {

    var app;

    /**
     * Inicializa el proceso de definición de los parámetros de configuración 
     * de la aplicación.
     * @method init
     * @param {http.Server} server
     * @return 
     */
    var init = function (server) {
        var Sockets = App.require('/da/Sockets');
        var SessionController = App.require('/bl/SessionController');
        Sockets.init(server);
        SessionController.getInstance().init();
    };

    /**
     * Establece los parámetros de configuración de Express y el motor de 
     * plantillas Swig y otros (logger, cookieParser, etc).
     * @method setupConfig
     * @return 
     */
    var setupConfig = function () {
        var favicon = require('serve-favicon');
        var logger = require('morgan');
        var cookieParser = require('cookie-parser');
        var bodyParser = require('body-parser');
        var compression = require('compression');
        var express = require('express');
        app = express();
        //--> View engine setup
        var swig = require('swig');
        app.set('views', App.getPath('/views'));
        app.engine('html', swig.renderFile);
        app.set('view engine', 'html');
        app.set('view cache', false);
        swig.setDefaults({cache: false});
        swig.setDefaults({cache: false, varControls: ['{@', '@}']});
        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        //--> File upload setup
        var multer = require('multer');
        var Controller = App.require('/bl/Controller');
        app.use(multer({
            dest: App.getPath(TEMP_PATH),
            onFileUploadComplete: Controller.model.onUpload
        }));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(cookieParser());
        app.use(compression());
        //app.use(express.static(App.getRootPath('public')));
        //app.use('/libs', express.static(App.getRootPath(LIBS_PATH)));
    };

    /**
     * Establece los parámetros de configuración de las rutas accesibles por 
     * medio del protocolo HTTP.
     * @method setupRoutes
     * @return 
     */
    var setupRoutes = function () {
        //--> Static routes
        var express = require('express');
        app.use(express.static(App.getRootPath('public')));
        app.use('/libs', express.static(App.getRootPath(LIBS_PATH)));
        //--> App routes
        var index = App.require('/routes/index');
        var model = App.require('/routes/model');
        var session = App.require('/routes/session');
        var info = App.require('/routes/info');
        app.use('/', index);
        app.use('/model', model);
        app.use('/session', session);
        app.use('/info', info);
        //--> Catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
        //--> Development error handler
        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {message: err.message, error: err});
            });
        }
        //--> Production error handler
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {message: err.message, error: {}});
        });
    };

    /**
     * Constructor de la clase.
     * @method __construct
     * @return 
     */
    var __construct = function () {
        App.include('/commons/Helper');
        setupConfig();
        setupRoutes();
        app.init_ = init;
    };

    /**
     * Returna la instancia de Express utilizada.
     * @method getExpress
     * @return {express} app
     */
    this.getExpress = function () {
        return app;
    };

    __construct();

};

/**
 * Retorn la ruta desde el directorio raíz de la aplicación basado en la ruta 
 * recibida.
 * @method getRootPath
 * @param {String} filePath Ruta relativa del archivo
 * @return CallExpression
 */
App.getRootPath = function (filePath) {
    var path = require('path');
    return path.join(ROOT_DIR, filePath);
};

/**
 * Retorn la ruta desde el directorio de los archivos del servidor de la 
 * aplicación basado en la ruta recibida.
 * @method getPath
 * @param {String} filePath Ruta relativa del archivo
 * @return CallExpression
 */
App.getPath = function (filePath) {
    var path = require('path');
    return path.join(ROOT_DIR, '/server', filePath);
};

/**
 * Incluye el cídigo de un archivo dentro de la aplicación.
 * @method include
 * @param {String} file Ruta relativa del archivo
 * @return 
 */
App.include = function (filePath) {
    var fs = require('fs');
    eval(fs.readFileSync(App.getRootPath(filePath + '.js')) + '');
};

/**
 * Realiza el require de cualquiera de los módulos ubicados dentro del directorio
 * de los archivos del servidor de la aplicación.
 * @method require
 * @param {String} module Ruta relativa del modulo
 * @return CallExpression
 */
App.require = function (module) {
    return (require(App.getPath(module)));
};

/**
 * Imprime en consola un mensaje de depuración, personalizado para la aplicación.
 * La impresión del mensaje es condicionada por el valor de la variable global  
 * <i>DEBUG_MODE<i> en el archivo de configuración de la aplicación y el valor del
 * parámetro <i>mode</i> recibido
 * @method debug
 * @param {String} message El mensaje a imprimir en consola
 * @param {String} user El usuario que está enviando el mensaje (cuando se está en modo simulación)
 * @param {String} session La sesion del usuario que está enviando el mensaje (cuando se está en modo simulación)
 * @param {String} mode El modo de debug a aplicar al mensaje
 * @return 
 */
App.debug = function (message, user, session, mode) {
    if (!mode) {
        mode = 1;
    }
    if (mode <= DEBUG_MODE) {
        if (session) {
            console.log('DEBUG =>', session, '=>', user, '=>', message);
        } else {
            console.log('DEBUG =>', user, '=>', message);
        }
    }
};

/**
 * Retorna la instancia del objeto Express utilizado
 * @method getInstance
 * @return {express} Instancia de express
 */
App.getInstance = function () {
    if (typeof App._instance_ !== 'object') {
        App._instance_ = new App();
    }
    return App._instance_.getExpress();
};

/**
 * Description
 * @method isUserMaster
 * @param {String} masterPassword La contraseña del usuario maestro
 * @return BinaryExpression
 */
App.isUserMaster = function (masterPassword) {
    return (masterPassword === MASTER_PASSWORD);
};

module.exports = App;