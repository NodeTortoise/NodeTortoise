YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "App",
        "Controller",
        "Controller.model",
        "Controller.session",
        "Entities",
        "Entities.model",
        "Helper",
        "Model",
        "Model_List",
        "SQLite",
        "Session",
        "SessionController",
        "Simulation",
        "Sockets",
        "Sockets.Actions"
    ],
    "modules": [
        "Public",
        "Server"
    ],
    "allModules": [
        {
            "displayName": "Public",
            "name": "Public",
            "description": "Controla las acciones que se deben ejecutar en la página de Lista de Modelos"
        },
        {
            "displayName": "Server",
            "name": "Server",
            "description": "Provee las clases utilizadas en el <i>back-end</i> de la aplicación. Estas \nclases son procesadas por el servidor de NodeJS."
        }
    ],
    "elements": []
} };
});