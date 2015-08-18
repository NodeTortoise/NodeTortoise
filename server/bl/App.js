/* global __dirname, module, ROOT_DIR, DEBUG_MODE, MASTER_PASSWORD, TEMP_PATH, LIBS_PATH */

/**
 * Description
 * @return 
 */
App = function () {

    var app;

    /**
     * Description
     * @method init
     * @param {} server
     * @return 
     */
    var init = function (server) {
        var Sockets = App.require('/da/Sockets');
        var SessionController = App.require('/bl/SessionController');
        Sockets.init(server);
        SessionController.getInstance().init();
    };

    /**
     * Description
     * @method setupConfig
     * @return 
     */
    var setupConfig = function () {
        var express = require('express');
        var favicon = require('serve-favicon');
        var logger = require('morgan');
        var cookieParser = require('cookie-parser');
        var bodyParser = require('body-parser');
        var compression = require('compression');
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
        app.use(multer({
            dest: App.getPath(TEMP_PATH),
            onFileUploadComplete: onUploadModel
        }));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(cookieParser());
        app.use(compression());
        app.use(express.static(App.getRootPath('public')));
        app.use('/libs', express.static(App.getRootPath(LIBS_PATH)));
    };

    /**
     * Description
     * @method setupRoutes
     * @return 
     */
    var setupRoutes = function () {
        var index = App.require('/routes/index');
        var model = App.require('/routes/model');
        var session = App.require('/routes/session');
        var info = App.require('/routes/info');
        app.use('/', index);
        app.use('/model', model);
        app.use('/session', session);
        app.use('/info', info);
        //--> catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
        //--> development error handler
        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {message: err.message, error: err});
            });
        }
        //--> production error handler
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {message: err.message, error: {}});
        });
    };

    var onUploadModel = function (originalFile, req, res){
        var model = App.require('/bl/Model').getInstance();
        var success = model.add(originalFile, req.body.name, req.body.description);
        req.custom_parameters_ = {};
        req.custom_parameters_.success = success;
    };

    /**
     * Description
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
     * Description
     * @method getExpress
     * @return app
     */
    this.getExpress = function () {
        return app;
    };

    __construct();

};

/**
 * Description
 * @method getRootPath
 * @param {} filePath
 * @return CallExpression
 */
App.getRootPath = function (filePath) {
    var path = require('path');
    return path.join(ROOT_DIR, filePath);
};

/**
 * Description
 * @method getPath
 * @param {} filePath
 * @return CallExpression
 */
App.getPath = function (filePath) {
    var path = require('path');
    return path.join(ROOT_DIR, '/server', filePath);
};

/**
 * Description
 * @method include
 * @param {} file
 * @return 
 */
App.include = function (file) {
    var fs = require('fs');
    eval(fs.readFileSync(App.getRootPath(file + '.js')) + '');
};

/**
 * Description
 * @method require
 * @param {} module
 * @return CallExpression
 */
App.require = function (module) {
    return (require(App.getPath(module)));
};

/**
 * Description
 * @method debug
 * @param {} message
 * @param {} user
 * @param {} session
 * @param {} mode
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
 * Description
 * @method getInstance
 * @return CallExpression
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
 * @param {} masterPassword
 * @return BinaryExpression
 */
App.isUserMaster = function (masterPassword) {
    return (masterPassword === MASTER_PASSWORD);
};

module.exports = App;