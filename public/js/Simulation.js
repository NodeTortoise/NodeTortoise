/* global setup, go, io, Helper, world, Ractive, ENVIRONMENT, procedures, session, AgentStreamController */

var SERVER_ = 'localhost:3000';
var ENABLED_CONTROLS_ALL_USERS = true;
var ENVIRONMENT = 'TESTING'; // TESTING, PRODUCTION

/* TODO: remove, it's only for testing */
var MAIN_BROWSER = 'FIREFOX';

/**
 * Provee la lógica de interacción de las simulaciones con el servidor.
 * @class Simulation
 * @constructor
 * @module Public
 */
Simulation = function () {

    var self = this;
    var spinner, isTimeToSendApplyUpdate;
    var inputsSelector = '.netlogo-widget-container input:visible';
    var outputsSelector = '.netlogo-widget-container output:visible';
    var buttonsSelector = 'button.netlogo-widget.netlogo-button.netlogo-command, label.netlogo-widget.netlogo-button.netlogo-command input[type="checkbox"]';
    var speedInputSelector = '.netlogo-widget.netlogo-speed-slider input[type=range]';

    this.socket = null;
    this.firsTime = true;
    this.viewController = null;
    this._procedures = null;
    this.token = null;
    this.isMaster = null;
    this.isSocketReady = false;
    this.enabledControls = false;
    this.commands = {};

    var sessionName, modelName, modelFile, modelControls, modelCommands, overwritedCommands;

    /**
     * Inicializa la clase, realizando las configuraciones necesarias.
     * @method init
     */
    this.init = function () {
        isTimeToSendApplyUpdate = false;
        /*setInterval(function(){
            isTimeToSendApplyUpdate = true;
        }, 5000);*/
        doOverwriteFunctions();
        initWidgets();
        initNoMasterConnected();
        //initControls();
        sessionName = Helper.getURLParameter('s');
        modelFile = Helper.getLastURLPiece();
        self.socket = io.connect(SERVER_);
        initSockets();
        initOutputs();
    };

    /**
     * Realiza la conexión del cliente con el servidor por medio de <i>web sockets</i>.
     * @method connect
     * @return
     */
    var connect = function () {
        /* TODO: remove, it's only for testing */
        var name = (Helper.getBrowser()).toUpperCase();
        var password = name === MAIN_BROWSER ? MAIN_BROWSER : '';
        var enabledControls = ENABLED_CONTROLS_ALL_USERS;
        //var name = prompt('Digite su nombre');
        //var hash = prompt('Digite su contraseña de usuario maestro');
        //var enabledControls = ENABLED_CONTROLS_ALL_USERS;
        var params = {'session': sessionName, 'name': name, 'password': password, 'controls': enabledControls, 'modelFile': modelFile, 'modelName': modelName};
        self.sendAction('connect', params);
    };

    /**
     * Este método sobre-escribe el método <b>AgentStreamController.prototype.applyUpdate</b>
     * del código original de Tortoise. Se encarga de controlar la actualización
     * de la simulación (a nivel gráfico) y de los valores de los <i>outputs</i>.
     * En el caso del cliente maestro, se envía un mensaje al servidor para que 
     * los clientes realicen la actualización y finalmente se ejecuta el código
     * original de actualización. En el caso los clientes que no son maestros, 
     * se ignora cualquier proceso. En caso de que aún no se hara realizado 
     * la conexión con el <i>socket</i>, se ejecuta el código original de 
     * actualización, en ambos casos.
     * @method applyUpdate
     * @param {Object} agentStreamController El objeto AgentStreamController del modelo
     * @param {Object} modelUpdate El objeto que contiene las intrucciones de actualización
     * @return {Object} El resultado del proceso de actualiación. Este resultado proviene de
     * la lógica del código de Tortoise
     */
    this.applyUpdate = function (agentStreamController, modelUpdate) {
        /* TODO-FUTUREWORK: optimize to send less data in modelUpdate */
        if (!self.isSocketReady) {
            return agentStreamController._applyUpdate(modelUpdate);
        } else if (self.isMaster) {
            isTimeToSendApplyUpdate = false;
            var outputs = new Array();
            $(outputsSelector).each(function (index, value) {
                var ele = $(this);
                outputs.push({'name': ele.attr('data-name'), 'value': ele.val()});
            });
            self.sendAction('applyUpdate', {'model': modelUpdate, 'outputs': outputs});
            return agentStreamController._applyUpdate(modelUpdate);
        } else {
            return true;
        }
    };

    /**
     * Código ejecutado por los clientes no maestros al recibir un mensaje de 
     * actualización del modelo. Ejecuta las actualizaciones del modelo, haciendo 
     * la llamada al código de actualización original de <b>Tortoise</b> y 
     * llevando a cabo la actualización de los <i>outputs</i>.
     * @method applyUpdate_
     * @param {Object} modelUpdate El objeto que contiene las intrucciones de actualización
     * @param {Object} outputs Objeto que contiene las actualizaciones a ejecutar sobre los <i>outputs</i>
     */
    this.applyUpdate_ = function (model, outputs) {
        self.viewController._applyUpdate(model);
        for (var key in outputs) {
            //self.setGlobal(outputs[key].name, outputs[key].value);
            $('output[data-name="' + outputs[key].name + '"]').val(outputs[key].value);
        }
    };

    /**
     * Establece el valor de la velocidad de la simulación.
     * @method updateSpeed_
     * @param {Integer} value Valor de la velocidad
     */
    this.updateSpeed_ = function (value) {
        $(speedInputSelector).val(value);
    };

    /**
     * Dtermina si un widget es de tipo comando.
     * @method isCommandWidget
     * @param {Object} widget El widget
     * @return {Boolean} Verdadero o Falso
     */
    var isCommandWidget = function (widget) {
        return (widget.compiledSource && widget.buttonType && (widget.buttonType).toUpperCase() === 'OBSERVER');
    };

    /**
     * Ejecuta la acción de sobre-escribir las funciones originales de Tortoise, 
     * necesarias para la ejecución de la lógica personalizada.
     * @method doOverwriteFunctions
     */
    var doOverwriteFunctions = function () {
        world.observer['setGlobal_'] = world.observer.setGlobal;
        self.commands['setGlobal'] = function () {
            var params = arguments;
            world.observer.setGlobal_(params[0], params[1]);
        };
        world.observer.setGlobal = function () {
            var params = arguments;
            if (modelControls[params[0]]) {
                var simulation = Simulation.getInstance();
                if (self.isMaster || self.enabledControls) {
                    simulation.sendAction('setGlobal', {'params': params});
                    simulation['commands']['setGlobal'].apply(this, params);
                }
            } else {
                world.observer.setGlobal_.apply(this, params);
            }
        };
        $(speedInputSelector).change(function () {
            self.sendAction('updateSpeed', {value: $(this).val()});
        });
    };

    /**
     * Inicializa los widgets del modelo, para:
     * 1. Obtener los widget de tipo comando para sobre-escribir su funcionalidad
     * 2. Obtener y guardar los widget de tipo control para posteriormente 
     * sobre-escribir su funcionalidad.
     * @method initWidgets
     */
    var initWidgets = function () {
        modelControls = {};
        modelCommands = {};
        for (var i in session.widgetController.widgets) {
            var widgetData = session.widgetController.widgets[i];
            if (isCommandWidget(widgetData)) {
                var commandData = parseCommandWidget(widgetData);
                doOverwriteCommand(commandData);
                //console.log('commandData.source = ' + commandData.source);
                modelCommands[commandData.source] = commandData;
            } else if (widgetData.varName) {
                //console.log('widgetData.varName = ' + commandData.source);
                modelControls[widgetData.varName] = widgetData.varName;
            } else if (widgetData.source) {
                //console.log('widgetData.source = ' + commandData.source);
                modelControls[widgetData.source] = widgetData.source;
            } else {
                //console.log(widgetData);
            }
        }
    };

    /**
     * Extrae de un <i>widget</i> de tipo comando la información necesaria para
     * su posterior procesamiento.
     * @method parseCommandWidget
     * @param {Object} widgetData Los datos del <i>widget</i>
     * @return {Object} result
     */
    var parseCommandWidget = function (widgetData) {
        var dataStr = ((widgetData.compiledSource.result).replace('Call(', '')).replace(');', '');
        var parameters = dataStr.split(', ');
        var fnStr = parameters.shift().trim();
        var fnArr = fnStr.split('.');
        var fnParent = window;
        for (var i = 0; i < fnArr.length - 1; ++i) {
            fnParent = fnParent[fnArr[i]];
        }
        var fnName = fnArr[fnArr.length - 1];
        var fn = fnParent[fnName];
        var result = {'fnName': fnName, 'fnParent': fnParent, 'fn': fn, 'params': parameters, 'fnStr': fnStr, 'source': widgetData.source, 'isForever': widgetData.forever, 'send': true};
        return result;
    };

    /**
     * Sobre-escribe la funcionalidad de un comando
     * @method doOverwriteCommand
     * @param {Object} commandData Los datos del comando
     */
    var doOverwriteCommand = function (commandData) {
        if (self.commands[commandData.fnName]) {
            return;
        }
        self.commands[commandData.fnName] = commandData.fn;
        var fnParent = commandData.fnParent;
        fnParent[commandData.fnName] = function () {
            var params = arguments;
            var simulation = Simulation.getInstance();
            if (simulation.isMaster) {
                simulation.sendAction('executeCommand', {'command': commandData.fnName, 'params': params});
                simulation['commands'][commandData.fnName].apply(this, params);
            }
        };
    };

    var initOutputs = function(){
        $(outputsSelector).each(function(){
            var ele = $(this);
            var nameEle = $('.netlogo-label', ele.parent());
            ele.attr('data-name', Helper.removeSpecialChars(nameEle.text()));
        });
    };

    /**
     * Deshabilita los controles
     * @method disableControls
     */
    var disableControls = function () {
        /* TODO: make label.input buttons look like disabled */
        $(buttonsSelector).attr('disabled', true);
    };

    /**
     * Inicializa 
     * @method initNoMasterConnected
     */
    var initNoMasterConnected = function () {
        spinner = new Helper.spinner('.netlogo-widget-container', {'bgColor': '#000', 'opacity': 0.8, 'height': '100%'});
        disableControls();
    };

    /**
     * Envía un mensaje de ejecutar acción al servidor por medio de web sockets, 
     * para que sea enviada a los demás clientes en la sesión.
     * @method sendAction
     * @param {String} action La acción a ejecutar
     * @param {Object} params Los parámetros de la acción
     */
    this.sendAction = function (action, params) {
        action += '__fromClient';
        if (action !== 'executeCommand') {
            self.socket.emit(action, self.token, params);
        }
    };

    /**
     * Ejecuta la acción de inicialización de la sesión se simulación
     * @method start
     */
    this.start = function () {
        if (self.isMaster) {
            $(buttonsSelector).attr('disabled', false);
            $(inputsSelector).attr('disabled', false);
        } else if (self.enabledControls) {
            $(inputsSelector).attr('disabled', false);
        }
        spinner.remove();
    };

    /**
     * Ejecuta la acción de finalización de la sesión se simulación
     * @method end
     */
    this.end = function () {
        if (ENVIRONMENT === 'PRODUCTION') {
            alert('No master connected');
        }
        //location.reload();
        initNoMasterConnected();
    };

    this.overwritedCommands = {
        /**
         * Recibe del servidor la respuesta al conectarse a los web sockets
         * @method overwritedCommands.connect_Response
         * @param {Object} params Los parámetros recibidos
         */
        'connect_Response': function (params) {
            self.token = params.token;
            self.isMaster = params.master;
            self.enabledControls = params.controls;
            if (params.start) {
                self.start();
            }
            self.isSocketReady = true;
        },
        /**
         * Recibe del servidor la acción de actualizar usuarios
         * @method overwritedCommands.updateUsers
         * @param {Object} params Los parámetros de la acción
         */
        'updateUsers': function (params) {
            Simulation.formatUI.users(params.users);
        },
        /**
         * Recibe del servidor la acción de ejecutar comando
         * @method overwritedCommands.executeCommand
         * @param {Object} params Los parámetros de la acción
         */
        'executeCommand': function (params) {
            var paramsArr = $.map(params.params, function (value, index) {
                return [value];
            });
            self.commands[params.command].apply(this, paramsArr);
        },
        /**
         * Recibe del servidor la acción de definir valor de variable global de 
         * Tortoise
         * @method overwritedCommands.setGlobal
         * @param {Object} params Los parámetros de la acción
         */
        'setGlobal': function (params) {
            var paramsArr = $.map(params.params, function (value, index) {
                return [value];
            });
            self.commands['setGlobal'].apply(this, paramsArr);
        },
        /**
         * Recibe del servidor la acción de actualizar velocidad de la simulación
         * @method overwritedCommands.updateSpeed
         * @param {Object} params Los parámetros de la acción
         */
        'updateSpeed': function (params) {
            self.updateSpeed_(params.value);
        },
        /**
         * Recibe del servidor la acción de aplicar actualización de la simulación
         * @method overwritedCommands.applyUpdate
         * @param {Object} params Los parámetros de la acción
         */
        'applyUpdate': function (params) {
            /* TODO-FUTUREWORK: optimize to receive less data in modelUpdate */
            self.applyUpdate_(params.model, params.outputs);
        },
        /**
         * Recibe del servidor la acción de iniciar sesión de simulación
         * @method overwritedCommands.start
         * @param {Boolean} enabledControls Indica si los controles están habilitados o no
         */
        'start': function (enabledControls) {
            self.enabledControls = enabledControls;
            self.start();
        },
        /**
         * Recibe del servidor la acción de finalizar sesión de simulación
         * @method overwritedCommands.end
         */
        'end': function () {
            self.end();
        },
        /**
         * Recibe del servidor la acción de obtener mensaje
         * @method overwritedCommands.getMessage
         * @param {Object} params Los parámetros de la acción
         */
        'getMessage': function (params) {
            console.log(params);
        }
    };

    /**
     * Inicializa las acciones que se pueden recibir del servidor por medio de 
     * web sockets
     * @method initSockets
     */
    var initSockets = function () {
        self.socket.on('connect', function () {
            connect();
        });
        for (var action in self.overwritedCommands) {
            (function (action) {
                var actionName = action + '__fromServer';
                self.socket.on(actionName, function (params) {
                    self['overwritedCommands'][action](params);
                });
            })(action);
        }
    };

};

/**
 * Crea un objeto Simulation 
 * @method create
 * @return modelObj El objeto Simulation
 */
Simulation.create = function () {
    Ractive.DEBUG = false;
    var simulationObj = Simulation.getInstance();
    Simulation.setupObject(simulationObj);
    return simulationObj;
};

/**
 * Sobre-escribe algunos de los métodos de Tortoise, necesarios antes de que 
 * se inicialice Tortoise
 * @method setupObject
 * @param {Object} modelObj Objeto Simulation
 */
Simulation.setupObject = function (modelObj) {
    AgentStreamController.prototype._applyUpdate = AgentStreamController.prototype['applyUpdate'];
    AgentStreamController.prototype.applyUpdate = function (modelUpdate) {
        return modelObj.applyUpdate(this, modelUpdate);
    };
    window.Tortoise._fromCompiledModel = window.Tortoise.fromCompiledModel;
    window.Tortoise.fromCompiledModel = function (container, widgets, code, info, compiledSource, readOnly) {
        var session = window.Tortoise._fromCompiledModel(container, widgets, code, info, compiledSource, readOnly);
        modelObj.viewController = session.widgetController.viewController;
        return session;
    };
};

/**
 * Basado en el patrón <i>Singleton</i>, retorna una instancia del objeto Simulation
 * @method getInstance
 * @static
 * @return {Simulation} La instancia de Simulation
 */
Simulation.getInstance = function () {
    if (typeof Simulation.instance !== 'object') {
        Simulation.instance = new Simulation();
    }
    return Simulation.instance;
};

/**
 * Formatea la interfaz de gráfica en la página de simulación, para que cuente
 * con el menú y las demás opciones de la interfaz gráfica del resto de la 
 * aplicación.
 * @method formatUI
 */
Simulation.formatUI = function () {
    var uiResponse = $.ajax({
        type: 'GET',
        url: '/ui',
        dataType: 'html',
        async: false
    }).responseText;
    $('.netlogo-model', modelContent).css('width', '');
    var modelContent = $('.model-main-content').html();
    var layoutContent = $(uiResponse).filter('#wrapper');
    $('.model-main-content').append(layoutContent);
    $('.model-main-content').replaceWith(layoutContent);
    $('.main-content').html(modelContent);
    $('#menu-users-model').show();
    $(function () {
        $('.page-header-container h1').removeClass('page-header');
        $('.netlogo-model').css('width', '');
    });
};

/**
 * Formatea la sección de Usuarios de la sesión en interfaz de gráfica.
 * @method users
 * @param {Array} users La lista de usuario
 */
Simulation.formatUI.users = function (users) {
    var usersContainer = $('#menu-users-model-container');
    var userItemTemplate = $('.menu-users-model-container.template li.simple').clone();
    usersContainer.empty();
    for (var key in users) {
        var userItem;
        var name = users[key];
        if (name.indexOf('(master)') > -1) {
            name = name.replace('(master)', '');
            userItem = $('.menu-users-model-container.template li.master').clone();
            $('.menu-users-model-user-name', userItem).addClass('master').text(name.trim());
        } else {
            userItem = userItemTemplate.clone();
            $('.menu-users-model-user-name', userItem).text(name.trim());
        }
        usersContainer.append(userItem);
    }
};

$(function () {
    Simulation.getInstance().init();
});

Simulation.formatUI();