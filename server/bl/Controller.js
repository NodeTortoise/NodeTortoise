

/* global App, Helper, MODEL_URL_TEMPLATE, module */

/**
 * Description
 * @method responseOnErrorHTML
 * @param {} req
 * @param {} res
 * @param {} next
 * @param {} error
 * @param {} status
 * @return
 */
var responseOnErrorHTML = function (req, res, next, error, status) {
    App.debug(error, 'system');
    var err = new Error(error);
    err.status = (status) ? status : 500;
    next(err);
};

/**
 * Description
 * @method responseOnErrorJson
 * @param {} req
 * @param {} res
 * @param {} next
 * @param {} error
 * @param {} status
 * @return
 */
var responseOnErrorJson = function (req, res, next, error, status) {
    App.debug(error, 'system');
    res.statusCode = (status) ? status : 400;
    res.json({'success': false});
};

/**
 * Description
 * @return
 */
Controller = function () {
};

/**
 * Description
 * @method message
 * @param {} req
 * @param {} res
 * @param {} title
 * @param {} message
 * @return
 */
Controller.message = function (req, res, title, message) {
    var page = {'title': title, 'content_title': title};
    var data = {'message': message};
    res.render('message.html', {'page': page, 'data': data});
};

/**
 * Description
 * @method model
 * @return
 */
Controller.model = function () {
};

/**
 * Description
 * @method session
 * @return
 */
Controller.session = function () {
};

/**
 * Description
 * @method upload
 * @param {} req
 * @param {} res
 * @param {} next
 * @return
 */
Controller.model.upload = function (req, res, next) {
    var page = {'title': 'Subir Nuevo Modelo', 'content_title': 'Nuevo Modelo'};
    var data = {};
    res.render('model/upload.html', {'page': page, 'data': data});
};

/**
 * Description
 * @method success
 * @param {} req
 * @param {} res
 * @param {} next
 * @return
 */
Controller.model.upload.success = function (req, res, next) {
    var page = {'title': 'Modelo subido exitosamente', 'content_title': 'Modelo subido exitosamente'};
    var data = {};
    res.render('model/upload-success.html', {'page': page, 'data': data});
};

/**
 * Description
 * @method error
 * @param {} req
 * @param {} res
 * @param {} next
 * @return
 */
Controller.model.upload.error = function (req, res, next) {
    var page = {'title': 'Error al subir Modelo', 'content_title': 'Error al subir Modelo'};
    var data = {};
    res.render('model/upload-error.html', {'page': page, 'data': data});
};

/**
 * Description
 * @method list
 * @param {} req
 * @param {} res
 * @param {} next
 * @return
 */
Controller.model.list = function (req, res, next) {
    /**
     * Description
     * @method onSuccess
     * @param {} modelsList
     * @return
     */
    var onSuccess = function (modelsList) {
        var models = modelsList;
        var page = {'title': 'Librería de modelos', 'content_title': 'Librería de modelos'};
        var data = {'models': models};
        res.render('model/list.html', {'page': page, 'data': data});
    };
    /**
     * Description
     * @method onError
     * @param {} error
     * @return
     */
    var onError = function (error) {
        responseOnErrorHTML(req, res, next, error);
    };
    var Model = App.require('/bl/Model');
    Model.getInstance().list(onSuccess, onError);
};

/**
 * Description
 * @method delete
 * @param {} req
 * @param {} res
 * @param {} next
 * @return
 */
Controller.model.delete = function (req, res, next) {
    /**
     * Description
     * @method onSuccess
     * @return
     */
    var onSuccess = function () {
        res.json({'success': true});
    };
    /**
     * Description
     * @method onError
     * @param {} error
     * @return
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
 * Description
 * @method list
 * @param {} req
 * @param {} res
 * @param {} next
 * @return
 */
Controller.session.list = function (req, res, next) {
    /**
     * Description
     * @method afterGetModelsList
     * @param {} modelsList
     * @return
     */
    var afterGetModelsList = function (modelsList) {
        var SessionController = App.require('/bl/SessionController');
        var controller = SessionController.getInstance();
        var sessionsData = controller.getSessionList();
        var token = Helper.getHash(Helper.getRandomNumber(1, 1000), true);
        var models = modelsList;
        var sessions = {};
        for (var sessionName in sessionsData) {
            var users = controller.getSessionUsersQuantity(sessionName);
            var url = MODEL_URL_TEMPLATE.replace('@session@', sessionName).replace('@model@', controller.getSessionModel(sessionName));
            sessions[sessionName] = {'name': '', 'url': url, 'users': users};
        }
        ;
        /**
         * Description
         * @method getModelURL
         * @param {} modelFilename
         * @param {} token
         * @return CallExpression
         */
        var getModelURL = function (modelFilename, token) {
            return (MODEL_URL_TEMPLATE.replace('@session@', token).replace('@model@', modelFilename));
        };
        var page = {'title': 'Unirse o iniciar sesión', 'content_title': 'Unirse o iniciar sesión'};
        var data = {'sessions': sessions, 'models': models, 'token': token, 'getModelURL': getModelURL};
        res.render('session/list.html', {'page': page, 'data': data});
    };
    /**
     * Description
     * @method onError
     * @param {} error
     * @return
     */
    var onError = function (error) {
        responseOnErrorHTML(req, res, next, error);
    };
    var Model = App.require('/bl/Model');
    Model.getInstance().list(afterGetModelsList, onError);
};

Controller.model.onUpload = function (originalFile, req, res, next) {
    var model = App.require('/bl/Model').getInstance();
    var success = model.add(originalFile, req.body.name, req.body.description);
    req.custom_parameters_ = {};
    req.custom_parameters_.success = success;
};

module.exports = Controller;