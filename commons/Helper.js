Helper = function () {
};

Helper.getHash = function (string, addTimestamp) {
    var crypto = require('crypto');
    var shasum = crypto.createHash('sha1');
    if (addTimestamp) {
        string += ('_' + Date.now());
    }
    shasum.update(string);
    return shasum.digest('hex');
};

Helper.hasValue = function (value) {
    return (value !== undefined && value !== null);
};

Helper.spinner = function (el, options) {
    // Becomes this.options
    this.container = $(el);
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
            'z-index': 99999
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
    this.init();
};

Helper.executeFunctionByName = function (functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
};

Helper.get = function (value, defaultValue) {
    return ((value === undefined || value === null) ? defaultValue : value);
};

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

Helper.replaceAll = function (string, find, replace) {
    return string.replace(new RegExp(Helper.escapeRegExp(find), 'g'), replace);
};

Helper.escapeRegExp = function (string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

Helper.cleanFileName = function (fileName) {
    return Helper.replaceAll(fileName, ' ', '_').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
};

Helper.getRandomNumber = function (min, max) {
    return (Math.random() * (max - min) + min);
};

Helper.getURLParameter = function (name, url) {
    if (!url)
        url = location.href;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results === null ? null : results[1];
};

Helper.getLastURLPiece = function (url) {
    if (!url)
        url = location.pathname;
    var segmentArray = url.split('/');
    return segmentArray[segmentArray.length - 1];
};

Helper.trimRight = function (string, charlist) {
    if (charlist === undefined) {
        charlist = "\s";
    }
    return string.replace(new RegExp("[" + charlist + "]+$"), "");
};

Helper.trimLeft = function (string, charlist) {
    if (charlist === undefined)
        charlist = "\s";

    return string.replace(new RegExp("^[" + charlist + "]+"), "");
};
