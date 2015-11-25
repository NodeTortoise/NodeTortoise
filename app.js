/* global module, __dirname, GLOBAL, App */

var App = require('./server/bl/App');

GLOBAL.ROOT_DIR = __dirname;
GLOBAL.App = App;

module.exports = App.getInstance();
