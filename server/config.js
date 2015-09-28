/* global GLOBAL */

GLOBAL.DEBUG_MODE = 1; // 1, 2, 3, 4
GLOBAL.MASTER_PASSWORD = 'FIRST_USER_IS_MASTER';
GLOBAL.MODELS_PATH = '/public/simulation/';
GLOBAL.MODELS_TEMPLATE = '/views/model/model-template.html';
GLOBAL.LIBS_PATH = '/commons/';
GLOBAL.DB_PATH = '/db/server.db';
GLOBAL.TEMP_PATH = '/tmp/';
GLOBAL.MODEL_URL_TEMPLATE = '/simulation/@model@.html?s=@session@&n=@name@';
GLOBAL.TORTOISE_SET_SESSION_STRING = 'var session =';
GLOBAL.SESSION_CHECK_INACTIVITY_MINUTES = 5;
GLOBAL.SESSION_MAX_INACTIVITY_MINUTES = 15;