/* global App, Helper, MODEL_URL_TEMPLATE, module */

/**
 * Establece un error de sistema
 * @method responseOnErrorHTML
 * @private
 * @param {Request} req Objeto que representa la petición HTTP y contiene el <i>query string</i>, los parámetros, el cuerpo y las cabeceras HTTP, entro otros
 * @param {Response} res El objeto res representa la respuesta HTTP que una aplicación Express envía cuando se hace una petición HTTP.
 * @param {Function} next Función que continúa la ejecución en la búsqueda de rutas
 * @param {String} error El mensaje de error
 * @param {Integer} [status=500] El status del error
 */
var responseOnErrorHTML = function (req, res, next, error, status) {
    App.debug(error, 'system');
    var err = new Error(error);
    err.status = (status) ? status : 500;
    next(err);
};

/**
 * Establece un error de sistema para un servicio web
 * @method responseOnErrorJson
 * @private
 * @param {Request} req Objeto que representa la petición HTTP y contiene el <i>query string</i>, los parámetros, el cuerpo y las cabeceras HTTP, entro otros
 * @param {Response} res El objeto res representa la respuesta HTTP que una aplicación Express envía cuando se hace una petición HTTP.
 * @param {Function} next Función que continúa la ejecución en la búsqueda de rutas.
 * @param {String} error El mensaje de error
 * @param {Integer} [status=400] El status del error
 */
var responseOnErrorJson = function (req, res, next, error, status) {
    App.debug(error, 'system');
    res.statusCode = (status) ? status : 400;
    res.json({'success': false});
};

/**
 * Controla la capa negocio de la aplicación, haciendo la conexión entre la capa 
 * de datos y las vistas y aplicando la logica de negocio necesaria.
 * @class Controller
 * @module Server
 * @submodule Server-bl
 */
Controller = function () {
};

/**
 * Despliega una página genérica con un mensaje.
 * @method message
 * @static
 * @param {Request} req Objeto que representa la petición HTTP y contiene el <i>query string</i>, los parámetros, el cuerpo y las cabeceras HTTP, entro otros
 * @param {Response} res El objeto res representa la respuesta HTTP que una aplicación Express envía cuando se hace una petición HTTP.
 * @param {String} title El titulo de la pagina
 * @param {String} message El mensaje
 */
Controller.message = function (req, res, title, message) {
    var page = {'title': title, 'content_title': title};
    var data = {'message': message};
    res.render('message.html', {'page': page, 'data': data});
};

/**
 * Controla la capa de negocio que interactua con las acciones sobre los modelos.
 * @class Controller.model
 * @module Server
 * @submodule Server-bl
 */
Controller.model = function () {
};

/**
 * Controla la página de carga de modelos.
 * @method upload
 * @static
 * @param {Request} req Objeto que representa la petición HTTP y contiene el <i>query string</i>, los parámetros, el cuerpo y las cabeceras HTTP, entro otros
 * @param {Response} res El objeto res representa la respuesta HTTP que una aplicación Express envía cuando se hace una petición HTTP.
 * @param {Function} next Función que continúa la ejecución de búsqueda de rutas
 */
Controller.model.upload = function (req, res, next) {
    var page = {'title': 'Subir Nuevo Modelo', 'content_title': 'Nuevo Modelo'};
    var data = {};
    res.render('model/upload.html', {'page': page, 'data': data});
};

/**
 * Controla la página de modelo subido exitosamente.
 * @method upload.success
 * @static
 * @param {Request} req Objeto que representa la petición HTTP y contiene el <i>query string</i>, los parámetros, el cuerpo y las cabeceras HTTP, entro otros
 * @param {Response} res El objeto res representa la respuesta HTTP que una aplicación Express envía cuando se hace una petición HTTP.
 * @param {Function} next Función que continúa la ejecución de búsqueda de rutas
 */
Controller.model.upload.success = function (req, res, next) {
    var page = {'title': 'Modelo subido exitosamente', 'content_title': 'Modelo subido exitosamente'};
    var data = {};
    res.render('model/upload-success.html', {'page': page, 'data': data});
};

/**
 * Controla la página de error al subir un modelo.
 * @method upload.error
 * @static
 * @param {Request} req Objeto que representa la petición HTTP y contiene el <i>query string</i>, los parámetros, el cuerpo y las cabeceras HTTP, entro otros
 * @param {Response} res El objeto res representa la respuesta HTTP que una aplicación Express envía cuando se hace una petición HTTP.
 * @param {Function} next Función que continúa la ejecución en la búsqueda de rutas
 */
Controller.model.upload.error = function (req, res, next) {
    var page = {'title': 'Error al subir Modelo', 'content_title': 'Error al subir Modelo'};
    var data = {};
    res.render('model/upload-error.html', {'page': page, 'data': data});
};

/**
 * Controla la subida de un archivo de modelo.
 * @method onUpload
 * @static
 * @param {String} originalFile Archivo original del modelo subido.
 * @param {Request} req Objeto que representa la petición HTTP y contiene el <i>query string</i>, los parámetros, el cuerpo y las cabeceras HTTP, entro otros
 * @param {Response} res El objeto res representa la respuesta HTTP que una aplicación Express envía cuando se hace una petición HTTP.
 * @param {Function} next Función que continúa la ejecución en la búsqueda de rutas
 */
Controller.model.onUpload = function (originalFile, req, res, next) {
    var model = App.require('/bl/Model').getInstance();
    var success = model.add(originalFile, req.body.name, req.body.description);
    req.custom_parameters_ = {};
    req.custom_parameters_.success = success;
};

/**
 * Controla la página de listado de modelos.
 * @method list
 * @static
 * @param {Request} req Objeto que representa la petición HTTP y contiene el <i>query string</i>, los parámetros, el cuerpo y las cabeceras HTTP, entro otros
 * @param {Response} res El objeto res representa la respuesta HTTP que una aplicación Express envía cuando se hace una petición HTTP.
 * @param {Function} next Función que continúa la ejecución en la búsqueda de rutas
 */
Controller.model.list = function (req, res, next) {
    /**
     * Función que ejecuta después de obtener la lista de modelos.
     * @event list.onSuccess
     * @param {Array} modelsList Listado de modelos
     */
    var onSuccess = function (modelsList) {
        var models = modelsList;
        var page = {'title': 'Librería de modelos', 'content_title': 'Librería de modelos'};
        var data = {'models': models};
        res.render('model/list.html', {'page': page, 'data': data});
    };
    /**
     * Función que ejecuta después si hay un error al obtener la lista de modelos.
     * @event list.onError
     * @param {String} error El mensaje de error
     */
    var onError = function (error) {
        responseOnErrorHTML(req, res, next, error);
    };
    var Model = App.require('/bl/Model');
    Model.getInstance().list(onSuccess, onError);
};

/**
 * Controla el borrado de un modelo.
 * @method delete
 * @static
 * @param {Request} req Objeto que representa la petición HTTP y contiene el <i>query string</i>, los parámetros, el cuerpo y las cabeceras HTTP, entro otros
 * @param {Response} res El objeto res representa la respuesta HTTP que una aplicación Express envía cuando se hace una petición HTTP.
 * @param {Function} next Función que continúa la ejecución en la búsqueda de rutas
 */
Controller.model.delete = function (req, res, next) {
    /**
     * Función que ejecuta después de obtener la lista de modelos.
     * @event delete.onSuccess
     */
    var onSuccess = function () {
        res.json({'success': true});
    };
    /**
     * Función que ejecuta después si hay un error al eliminar el modelo.
     * @event delete.onError
     * @param {String} error El mensaje de error
     */
    var onError = function (error) {
        responseOnErrorJson(req, res, next, error, 400);
    };
    if (!req.body.id) {
        onError('No ID to delete');
        return;
    }
    var Model = App.require('/bl/Model');
    Model.getInstance().delete(req.body.id, req.params.filename, onSuccess, onError);
};

/**
 * Controla la capa de negocio que interactua con las sesiones de simulaciones.
 * @class Controller.session
 * @module Server
 * @submodule Server-bl
 */
Controller.session = function () {
};

/**
 * Controla la página de listado de sesiones de simulación.
 * @method list
 * @static
 * @param {Request} req Objeto que representa la petición HTTP y contiene el <i>query string</i>, los parámetros, el cuerpo y las cabeceras HTTP, entro otros
 * @param {Response} res El objeto res representa la respuesta HTTP que una aplicación Express envía cuando se hace una petición HTTP.
 * @param {Function} next Función que continúa la ejecución en la búsqueda de rutas
 */
Controller.session.list = function (req, res, next) {
    /**
     * Función que ejecuta después de obtener la lista de modelos.
     * @event list.afterGetModelsList
     * @param {Array} modelsList La lista de modelos
     */
    var afterGetModelsList = function (modelsList) {
        var SessionController = App.require('/bl/SessionController');
        var controller = SessionController.getInstance();
        var sessionsData = controller.getSessionList();
        var token = Helper.getHash(Helper.getRandomNumber(1, 1000), true);
        var sessions = {};
        for (var sessionName in sessionsData) {
            var usersInSession = controller.getSessionUsersQuantity(sessionName);
            if(usersInSession > 0){
                var sessionData = sessionsData[sessionName];
                var url = MODEL_URL_TEMPLATE.replace('@session@', sessionName).replace('@model@', controller.getSessionModel(sessionName));
                var sessionName = unescape(sessionData.name) + ' (' + sessionData.master + ')';
                sessions[sessionName] = {'name': sessionName, 'url': url.replace('.html.html', '.html'), 'users': usersInSession};
            }
        }
        /**
         * Función para obtener la URL a un modelo.
         * @event list.getModelURL
         * @param {String} modelFilename El nombre de archivo del modelo sin extensión
         * @param {String} modelName El nombre del modelo
         * @param {String} token Token del usuario
         * @return {String} La URL al modelo
         */
        var getModelURL = function (modelFilename, modelName, token) {
            return (MODEL_URL_TEMPLATE.replace('@session@', token).replace('@model@', modelFilename).replace('@name@', escape(modelName)));
        };
        var page = {'title': 'Unirse o iniciar sesión', 'content_title': 'Unirse o iniciar sesión'};
        var data = {'sessions': sessions, 'models': modelsList, 'token': token, 'getModelURL': getModelURL};
        res.render('session/list.html', {'page': page, 'data': data});
    };
    /**
     * Función que ejecuta después si hay un error al obtener la lista de modelos.
     * @event list.onError
     * @param {String} error El mensaje de error
     */
    var onError = function (error) {
        responseOnErrorHTML(req, res, next, error);
    };
    var Model = App.require('/bl/Model');
    Model.getInstance().list(afterGetModelsList, onError);
};

module.exports = Controller;