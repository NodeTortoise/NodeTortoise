/* global setup, go, io, Helper, world, Ractive, ENVIRONMENT, procedures, session, AgentStreamController */

var SERVER_ = 'localhost:3000';
var ENABLED_CONTROLS_ALL_USERS = true;
var ENVIRONMENT = 'TESTING'; // TESTING, PRODUCTION

/* TODO: remove, it's only for testing */
var MAIN_BROWSER = 'FIREFOX';

/**
 * Provee la logica de interaccion de las simulaciones con el servidor.
 * @class Simulation
 * @constructor
 * @module Public
 */
Simulation = function () {

    var self = this;
    var spinner;
    var inputsSelector = '.netlogo-widget-container input:visible';
    var outputsSelector = '.netlogo-widget-container output:visible';
    var buttonsSelector = 'button.netlogo-widget.netlogo-button.netlogo-command, label.netlogo-widget.netlogo-button.netlogo-command, label.netlogo-widget.netlogo-button.netlogo-command input[type="checkbox"]';
    var speedInputSelector = '.netlogo-widget.netlogo-speed-slider input[type=range]';
    var goButtonCheckboxSelector = 'label.netlogo-widget.netlogo-button.netlogo-forever-button.netlogo-command input[type="checkbox"]';

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
        initWidgets();
        overwriteControls();
        initNoMasterConnected();
        //initControls();
        sessionName = Helper.getURLParameter('s');
        modelName = Helper.getURLParameter('n');
        modelFile = Helper.getLastURLPiece();
        self.socket = io.connect(SERVER_);
        initSockets();
        var goButton = $(goButtonCheckboxSelector).parent();
        /*goButton.click(function (event) {
         //event.preventDefault();
         event.run();
         console.log(goButton.hasClass('netlogo-active'));
         if (!goButton.hasClass('netlogo-active')) {
         disableInputs();
         } else {
         enableInputs();
         }
         });*/
        //initOutputs();
    };

    /**
     * Realiza la conexion del cliente con el servidor por medio de <i>web sockets</i>.
     * @method connect
     * @return
     */
    var connect = function () {
        //var name = (Helper.getBrowser()).toUpperCase();
        var name = prompt('Digite su nombre');
        var password = name === MAIN_BROWSER ? MAIN_BROWSER : '';
        var enabledControls = ENABLED_CONTROLS_ALL_USERS;
        var params = {'session': sessionName, 'name': name, 'password': password, 'controls': enabledControls, 'modelFile': modelFile, 'modelName': modelName};
        self.sendAction('connect', params);
    };

    /**
     * Este metodo sobre-escribe el metodo <b>AgentStreamController.prototype.applyUpdate</b>
     * del codigo original de Tortoise. Se encarga de controlar la actualizacion
     * de la simulacion (a nivel grafico) y de los valores de los <i>outputs</i>.
     * En el caso del cliente maestro, se envia un mensaje al servidor para que 
     * los clientes realicen la actualizacion y finalmente se ejecuta el codigo
     * original de actualizacion. En el caso los clientes que no son maestros, 
     * se ignora cualquier proceso. En caso de que aun no se hara realizado 
     * la conexion con el <i>socket</i>, se ejecuta el codigo original de 
     * actualizacion, en ambos casos.
     * @method applyUpdate
     * @param {Object} agentStreamController El objeto AgentStreamController del modelo
     * @param {Object} modelUpdate El objeto que contiene las intrucciones de actualizacion
     * @return {Object} El resultado del proceso de actualiacion. Este resultado proviene de
     * la logica del codigo de Tortoise
     */
    this.applyUpdate = function (agentStreamController, modelUpdate) {
        /* TODO-FUTUREWORK: optimize to send less data in modelUpdate */
        if (!self.isSocketReady) {
            return agentStreamController._applyUpdate(modelUpdate);
        } else if (self.isMaster) {
            var outputs = new Array();
            /*var outputs = new Array();
             $(outputsSelector).each(function (index, value) {
             var ele = $(this);
             outputs.push({'name': ele.attr('data-name'), 'value': ele.val()});
             });*/
            self.sendAction('applyUpdate', {'model': modelUpdate, 'outputs': outputs});
            return agentStreamController._applyUpdate(modelUpdate);
        } else {
            return true;
        }
    };

    /**
     * Codigo ejecutado por los clientes no maestros al recibir un mensaje de 
     * actualizacion del modelo. Ejecuta las actualizaciones del modelo, haciendo 
     * la llamada al codigo de actualizacion original de <b>Tortoise</b> y 
     * llevando a cabo la actualizacion de los <i>outputs</i>.
     * @method applyUpdate_
     * @param {Object} modelUpdate El objeto que contiene las intrucciones de actualizacion
     * @param {Object} outputs Objeto que contiene las actualizaciones a ejecutar sobre los <i>outputs</i>
     */
    this.applyUpdate_ = function (model, outputs) {
        self.viewController._applyUpdate(model);
        /*for (var key in outputs) {
         //self.setControl(outputs[key].name, outputs[key].value);
         $('output[data-name="' + outputs[key].name + '"]').val(outputs[key].value);
         }*/
    };

    /**
     * Establece el valor de la velocidad de la simulacion.
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
     * Inicializa los widgets del modelo, para:
     * 1. Obtener los widget de tipo comando para sobre-escribir su funcionalidad
     * 2. Obtener y guardar los widget de tipo control para posteriormente 
     * sobre-escribir su funcionalidad.
     * @method initWidgets
     */
    var initWidgets = function () {
        modelCommands = {};
        modelControls = new Array();
        for (var i in session.widgetController.widgets) {
            var widgetData = session.widgetController.widgets[i];
            if (isCommandWidget(widgetData)) {
                var commandData = parseCommandWidget(widgetData);
                overwriteCommand(commandData);
                modelCommands[commandData.source] = commandData;
            } else if (widgetData.varName) {
                //console.log('widgetData.varName = ' + widgetData.varName);
                modelControls.push(widgetData.varName);
            } else if (widgetData.source) {
                //console.log('widgetData.source = ' + widgetData.source);
                modelControls.push(widgetData.source);
            } else {
                //console.log(widgetData);
            }
        }
    };

    /**
     * Extrae de un <i>widget</i> de tipo comando la informacion necesaria para
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
     * @method overwriteCommand
     * @param {Object} commandData Los datos del comando
     */
    var overwriteCommand = function (commandData) {
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

    /**
     * Ejecuta la accion de sobre-escribir las funciones originales de Tortoise, 
     * necesarias para la ejecucion de la logica personalizada.
     * @method overwriteControls
     */
    var overwriteControls = function () {
        $(inputsSelector).each(function () {
            var ele = $(this);
            var label = ele.parent().find('.netlogo-label').text();
            if (!label) {
                label = ele.parent().parent().find('.netlogo-label').text();
            }
            if (label) {
                ele.attr('data-name', label);
                ele.change(function () {
                    sendInputValue(ele.attr('data-name'));
                });
            }
        });
        $(speedInputSelector).change(function () {
            if (self.isMaster || self.enabledControls) {
                self.sendAction('updateSpeed', {value: $(this).val()});
            }
        });
    };

    var sendInputValue = function (name) {
        if (self.isMaster || self.enabledControls) {
            var value = world.observer.getGlobal(name);
            Simulation.getInstance().sendAction('setControl', {'name': name, 'value': value});
        }
    };

    var setInputValue = function (name, value) {
        if (self.isMaster) {
            world.observer.setGlobal(name, value);
        } else {
            $('input[data-name="' + name + '"]').val(value);
        }
    };

    var initOutputs = function () {
        $(outputsSelector).each(function () {
            var ele = $(this);
            var nameEle = $('.netlogo-label', ele.parent());
            ele.attr('data-name', nameEle.text());
        });
    };

    /**
     * Deshabilita los botones
     * @method disableButtons
     */
    var disableButtons = function () {
        $(buttonsSelector).attr('disabled', true).addClass('button-disabled');
    };

    /**
     * Habilita los botones
     * @method enableButtons
     */
    var enableButtons = function () {
        $(buttonsSelector).attr('disabled', false).removeClass('button-disabled');
    };

    /**
     * Deshabilita los controles de entrada
     * @method disableInputs
     */
    var disableInputs = function () {
        $(inputsSelector).attr('disabled', true);
    };

    /**
     * Habilita los controles de entrada
     * @method enableInputs
     */
    var enableInputs = function () {
        $(inputsSelector).attr('disabled', false);
    };

    /**
     * Inicializa 
     * @method initNoMasterConnected
     */
    var initNoMasterConnected = function () {
        spinner = new Helper.spinner('.netlogo-widget-container', {'bgColor': '#000', 'opacity': 0.8, 'height': '100%'});
        disableButtons();
    };

    /**
     * Envia un mensaje de ejecutar accion al servidor por medio de web sockets, 
     * para que sea enviada a los demas clientes en la sesion.
     * @method sendAction
     * @param {String} action La accion a ejecutar
     * @param {Object} params Los parametros de la accion
     */
    this.sendAction = function (action, params) {
        action += '__fromClient';
        if (action !== 'executeCommand') {
            self.socket.emit(action, self.token, params);
        }
    };

    /**
     * Ejecuta la accion de inicializacion de la sesion se simulacion
     * @method start
     */
    this.start = function () {
        if (self.isMaster) {
            enableButtons();
            enableInputs();
        } else if (self.enabledControls) {
            enableInputs();
        }
        spinner.remove();
    };

    /**
     * Ejecuta la accion de finalizacion de la sesion se simulacion
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
         * @param {Object} params Los parametros recibidos
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
         * Recibe del servidor la accion de actualizar usuarios
         * @method overwritedCommands.updateUsers
         * @param {Object} params Los parametros de la accion
         */
        'updateUsers': function (params) {
            Simulation.formatUI.users(params.users);
        },
        /**
         * Recibe del servidor la accion de ejecutar comando
         * @method overwritedCommands.executeCommand
         * @param {Object} params Los parametros de la accion
         */
        'executeCommand': function (params) {
            var paramsArr = $.map(params.params, function (value, index) {
                return [value];
            });
            self.commands[params.command].apply(this, paramsArr);
        },
        /**
         * Recibe del servidor la accion de definir valor de variable global de 
         * Tortoise
         * @method overwritedCommands.setControl
         * @param {Object} params Los parametros de la accion
         */
        'setControl': function (params) {
            setInputValue(params.name, params.value);
        },
        /**
         * Recibe del servidor la accion de actualizar velocidad de la simulacion
         * @method overwritedCommands.updateSpeed
         * @param {Object} params Los parametros de la accion
         */
        'updateSpeed': function (params) {
            self.updateSpeed_(params.value);
        },
        /**
         * Recibe del servidor la accion de aplicar actualizacion de la simulacion
         * @method overwritedCommands.applyUpdate
         * @param {Object} params Los parametros de la accion
         */
        'applyUpdate': function (params) {
            /* TODO-FUTUREWORK: optimize to receive less data in modelUpdate */
            self.applyUpdate_(params.model, params.outputs);
        },
        /**
         * Recibe del servidor la accion de iniciar sesion de simulacion
         * @method overwritedCommands.start
         * @param {Boolean} enabledControls Indica si los controles estan habilitados o no
         */
        'start': function (enabledControls) {
            self.enabledControls = enabledControls;
            self.start();
        },
        /**
         * Recibe del servidor la accion de finalizar sesion de simulacion
         * @method overwritedCommands.end
         */
        'end': function () {
            self.end();
        },
        /**
         * Recibe del servidor la accion de obtener mensaje
         * @method overwritedCommands.getMessage
         * @param {Object} params Los parametros de la accion
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
 * Sobre-escribe algunos de los metodos de Tortoise, necesarios antes de que 
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
 * Basado en el patron <i>Singleton</i>, retorna una instancia del objeto Simulation
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
 * Formatea la interfaz de grafica en la pagina de simulacion, para que cuente
 * con el menu y las demas opciones de la interfaz grafica del resto de la 
 * aplicacion.
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
 * Formatea la seccion de Usuarios de la sesion en interfaz de grafica.
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