/**
 * Funciones utilitarias.
 * @class Helper
 * @module Commons
 */
Helper = function () {
};

/**
 * Genera un hash a partir de una cadena de caracteres (<i>string</i>).
 * @method getHash
 * @static
 * @param {String} string Cada de caracteres base para el hash
 * @param {Booolean} addTimestamp Indica si se concatena la hora actual a la cadena de caracteres
 */
Helper.getHash = function (string, addTimestamp) {
    var crypto = require('crypto');
    var shasum = crypto.createHash('sha1');
    if (addTimestamp) {
        string += ('_' + Date.now());
    }
    shasum.update(string);
    return shasum.digest('hex');
};

/**
 * Indica si una variable tiene valor asignado.
 * @method hasValue
 * @static
 * @param {String} value Variable a analizar
 */
Helper.hasValue = function (value) {
    return (value !== undefined && value !== null);
};

/**
 * Genera un <i>spinner</i> sobre un elemento del HTML.
 * @method spinner
 * @static
 * @param {String} elementSelector Selector del elemento HTML
 * @param {Object} options Opciones para el <i>spinner</i>
 */
Helper.spinner = function (elementSelector, options) {
    // Becomes this.options
    this.container = $(elementSelector);
    var defaults = {
        bgColor: 'transparent',
        duration: 800,
        opacity: 0.7,
        classOveride: false,
        top: '0',
        left: '0',
        position: 'relative',
        width: this.container.width(),
        height: this.container.height()
    };
    this.options = jQuery.extend(defaults, options);
    this.init = function () {
        var container = this.container;
        // Delete any other loaders
        this.remove();
        // Create the overlay
        var overlay = $('<div></div>').css({
            'background-color': this.options.bgColor,
            'opacity': this.options.opacity,
            'width': this.options.width,
            'height': this.options.height,
            'position': this.options.position,
            'top': this.options.top,
            'left': this.options.left,
            'z-index': 99998
        }).addClass('ajax_overlay');
        // add an overiding class name to set new loader style
        if (this.options.classOveride) {
            overlay.addClass(this.options.classOveride);
        }
        // insert overlay and loader into DOM
        container.append(overlay.append($('<div></div>').addClass('ajax_loader')).fadeIn(this.options.duration));
    };
    this.remove = function () {
        var overlay = this.container.children(".ajax_overlay");
        if (overlay.length) {
            overlay.fadeOut(this.options.classOveride, function () {
                overlay.remove();
            });
        }
    };
    this.show = function(){
        this.remove();
        this.init();
    };
    this.init();
};

/**
 * Ejecuta una función a partir del nombre
 * @method executeFunctionByName
 * @static
 * @param {String} functionName Nombre de la función
 * @param {Array|String} context Contexto(s) de la función
 */
Helper.executeFunctionByName = function (functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
};

/**
 * Obtiene el valor almacenado en una variable o un valor por defecto si esta no
 * está asignada o es nula.
 * @method get
 * @static
 * @param {String} value Variable a analizar
 * @param {String} defaultValue Valor por defecto
 */
Helper.get = function (value, defaultValue) {
    return ((value === undefined || value === null) ? defaultValue : value);
};

/**
 * Obtiene la versión de navegador de Internet utilizada.
 * @method getBrowser
 * @static
 */
Helper.getBrowser = function () {
    if (!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) { // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
        return 'Opera';
    } else if (typeof InstallTrigger !== 'undefined') { //Firefox 1.0+
        return 'Firefox';
    } else if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) { // At least Safari 3+: "[object HTMLElementConstructor]"
        return 'Safari';
    } else if (!!window.chrome) { // Chrome 1+
        return 'Chrome';
    } else if (/*@cc_on!@*/false || !!document.documentMode) { // At least IE6
        return 'Internet Explorer';
    } else {
        return 'Unknown';
    }
};

/**
 * Asigna la ejecución de una función, cual se termina la carga de una página.
 * @method onload
 * @static
 * @param {Function} functionName Función a asignar
 */
Helper.onload = function (functionName) {
    if (window.attachEvent) {
        window.attachEvent('onload', functionName);
    } else {
        if (window.onload) {
            var curronload = window.onload;
            var newonload = function () {
                curronload();
                functionName();
            };
            window.onload = newonload;
        } else {
            window.onload = functionName;
        }
    }
};

/**
 * Busca un fragmento en una cadena de caracteres y reemplaza todas las
 * coincidencias.
 * @method replaceAll
 * @static
 * @param {String} string Cadena de caracteres donde se buscarán las coincidencias
 * @param {String} find Cadena de caracteres a buscar
 * @param {String} replace Cadena de caracteres que reemplazará
 */
Helper.replaceAll = function (string, find, replace) {
    return string.replace(new RegExp(Helper.escapeRegExp(find), 'g'), replace);
};

/**
 * Agrega el caracter de escape, a los caracteres especiales en una cadena.
 * @method escapeRegExp
 * @static
 * @param {String} string La cadena de caracteres
 */
Helper.escapeRegExp = function (string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

/**
 * Formate un nombre de archivo, eliminando los caracteres especiales,
 * convirtiéndolo a minúsculas y remplazando los espaciones por guiones bajos.
 * convirtiéndole.
 * @method removeSpecialChars
 * @static
 * @param {String} fileName Nombre del archivo
 */
Helper.removeSpecialChars = function (fileName) {
    return Helper.replaceAll(fileName, ' ', '_').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
};

/**
 * Indica si una variable tiene valor asignado.
 * @method getRandomNumber
 * @static
 * @param {Integer} min Valor mínimo
 * @param {Integer} max Valor máximo
 */
Helper.getRandomNumber = function (min, max) {
    return (Math.random() * (max - min) + min);
};

/**
 * Obtiene un parámetro <i>GET</i> de una URL.
 * @method getURLParameter
 * @static
 * @param {String} name Nombre del parámetro
 * @param {String} url La URL
 */
Helper.getURLParameter = function (name, url) {
    if (!url)
        url = location.href;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results === null ? null : results[1];
};

/**
 * Obtiene la última sección de un URL.
 * @method getLastURLPiece
 * @static
 * @param {String} url La URL
 */
Helper.getLastURLPiece = function (url) {
    if (!url)
        url = location.pathname;
    var segmentArray = url.split('/');
    return segmentArray[segmentArray.length - 1];
};

/**
 * Elimina caracteres al final de una cadena de caracteres.
 * @method trimRight
 * @static
 * @param {String} string Cadena de caracteres a la cual se le aplicara la función
 * @param [String] string Cadena de caracteres con los caracteres a reemplazar.
 * Por defecto se reemplazan los espacios.
 */
Helper.trimRight = function (string, charlist) {
    if (charlist === undefined) {
        charlist = "\s";
    }
    return string.replace(new RegExp("[" + charlist + "]+$"), "");
};

/**
 * Elimina caracteres al inicio de una cadena de caracteres.
 * @method trimLeft
 * @static
 * @param {String} string Cadena de caracteres a la cual se le aplicara la función
 * @param [String] string Cadena de caracteres con los caracteres a reemplazar.
 * Por defecto se reemplazan los espacios.
 */
Helper.trimLeft = function (string, charlist) {
    if (charlist === undefined) {
        charlist = "\s";
    }
    return string.replace(new RegExp("^[" + charlist + "]+"), "");
};

/**
 * Convierte una cadena de caracteres a entidades HTML
 * @method toHTMLEntities
 * @static
 * @param {String} string Cadena de caracteres a la cual se le aplicara la función
 */
Helper.toHTMLEntities = function (string) {
    return string.replace(/./gm, function (s) {
        return "&#" + s.charCodeAt(0) + ";";
    });
};

/**
 * Crea una cadena de caracteres desde una entidad HTML
 * @method fromHTMLEntities
 * @static
 * @param {String} string Cadena de caracteres a la cual se le aplicara la función
 */
Helper.fromHTMLEntities = function (string) {
    return (string + "").replace(/&#\d+;/gm, function (s) {
        return String.fromCharCode(s.match(/\d+/gm)[0]);
    });
};

/*
 * Da formato a un número, completando con zeros a la izquierda la cantidad 
 * de dígitos indicada.
 * @method pad
 * @static
 * @param {Int} num El numero
 * @param {Int} La cantidad de digitos que debe contener el número
 * @return {String} El número formateado
 */
Helper.pad = function (num, size) {
    var s = "000000000" + num;
    return s.substr(s.length - size);
};

/*
 * Convierte un valor en minutos a milisegundos.
 * @method minutesToMiliseconds
 * @static
 * @param {Int} minutes El valor en minutos
 * @return {Int} El valor en milisegundos
 */
Helper.minutesToMiliseconds = function (minutes) {
    return (minutes * 60 * 1000);
};

/**
 * Da formato a una fecha.
 * @class formatDate
 * @module Commons
 */
Helper.formatDate = function(){  
};

/*
 * Da formato YYYY-MM-DD HH:MM a una fecha.
 * @method formatDate.YYYYMMDDHHMM24H
 * @static
 * @param {Date} date La fecha
 * @param [String] dateSeparator El separador para los valores de la fecha
 * @param [String] dateTimeSeparator El separador entre la fecha y la hora
 * @param [String] timeSeparator El separador para los valores de la hora
 * @return {String} La fecha en formato "YYYY-MM-DD HH:MM"
 */
Helper.formatDate.YYYYMMDDHHMM24H = function (date, dateSeparator, dateTimeSeparator, timeSeparator) {
    if (!dateSeparator) {
        dateSeparator = '-';
    }
    if (!dateTimeSeparator) {
        dateTimeSeparator = ' ';
    }
    if (!timeSeparator) {
        timeSeparator = ':';
    }
    return date.getFullYear() + dateSeparator + Helper.pad(date.getMonth() + 1, 2) + dateSeparator + Helper.pad(date.getDate(), 2) + dateTimeSeparator + Helper.pad(date.getHours(), 2) + timeSeparator + Helper.pad(date.getMinutes(), 2);
};

/*
 * Da formato "YYYY-MM-DD HH:MM AM/PM" a una fecha.
 * @method formatDate.YYYYMMDDHHMM12H
 * @static
 * @param {Date} date La fecha
 * @param [String] dateSeparator El separador para los valores de la fecha
 * @param [String] dateTimeSeparator El separador entre la fecha y la hora
 * @param [String] timeSeparator El separador para los valores de la hora
 * @return {String} La fecha en formato "YYYY-MM-DD HH:MM AM/PM"
 */
Helper.formatDate.YYYYMMDDHHMM12H = function (date, dateSeparator, dateTimeSeparator, timeSeparator) {
    if (!dateSeparator) {
        dateSeparator = '-';
    }
    if (!dateTimeSeparator) {
        dateTimeSeparator = ' ';
    }
    if (!timeSeparator) {
        timeSeparator = ':';
    }
    return date.getFullYear() + dateSeparator + Helper.pad(date.getMonth() + 1, 2) + dateSeparator + Helper.pad(date.getDate(), 2) + dateTimeSeparator + Helper.formatDate.HHMMAMPM(date);
};

/*
 * Da formato de 12 horas a la hora de una fecha.
 * @method formatDate.HHMMAMPM
 * @static
 * @param {Date} datetime La fecha
 * @param [String] timeSeparator El separador para los valores de la hora
 * @param [String] El separador para los valores de la hora
 * @return {String} La fecha en formato "HH:MM AM/PM"
 */
Helper.formatDate.HHMMAMPM = function(date, timeSeparator) {
    if (!timeSeparator) {
        timeSeparator = ':';
    }
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = Helper.pad(hours, 2) + timeSeparator + Helper.pad(minutes, 2) + ' ' + ampm;
    return strTime;
}
