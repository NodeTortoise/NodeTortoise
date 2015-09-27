/**
 * Controla las acciones que se deben ejecutar en la página de Lista de Modelos
 * @class Session_List
 * @constructor
 * @module Public
 */
Session_List = function () {

    var self = this;
    var modelsTable, sessionsTable;

    /**
     * Ejecuta las acciones de configuración necesarias
     * @method init
     */
    this.init = function () {
        initDataTables();
        $('.new-session').hide();
        $('#action-new-session').click(function (event) {
            event.preventDefault();
            var ele = $(this);
            if (!ele.hasClass('inactive')) {
                ele.blur();
                ele.addClass('inactive');
                $('#action-cancel-new-session').removeClass('inactive');
                $('.current-session').hide();
                $('.new-session').show();
            }
        });
        $('#action-cancel-new-session').click(function (event) {
            event.preventDefault();
            var ele = $(this);
            if (!ele.hasClass('inactive')) {
                ele.blur();
                ele.addClass('inactive');
                $('#action-new-session').removeClass('inactive');
                $('.new-session').hide();
                $('.current-session').show();
            }
        });
        $('#action-reload-sessions-models').click(function (event) {
            event.preventDefault();
            $(this).blur();
            self.reloadSessionsData();
        });
        $('#action-cancel-new-session').click();
    };
    
    /**
     * Recarga las tablas de lista de sesiones y lista de modelos
     * @method reloadSessionsData
     */
    this.reloadSessionsData = function (){
        var url = window.location.pathname;
        var tablesLoadCount = 0;
        var initDataTables_ = function(){
            ++tablesLoadCount;
            if(tablesLoadCount === 2){
                initDataTables();
            }
        };
        $.get(url, function(response){
            var modelsTable = $('#models-list-table-container');
            var sessionsTable = $('#sessions-list-table-container');
            var newModelsTable = $('#models-list-table-container', response).hide().html();
            var newSessionsTable = $('#sessions-list-table-container', response).hide().html();
            modelsTable.fadeOut('slow', function(){
                modelsTable.html(newModelsTable).fadeIn('slow');
                initDataTables_();
            });
            sessionsTable.fadeOut('slow', function(){
                sessionsTable.html(newSessionsTable).fadeIn('slow');
                initDataTables_();
            });
        });
    };

    /**
     * Inicializa la tabla que contiene la lista de sesiones
     * @method initModelsTable
     */
    var initDataTables = function () {
        if(modelsTable){
            modelsTable.destroy();
        }
        if(sessionsTable){
            sessionsTable.destroy();
        }
        modelsTable = $('#models-list-table').DataTable({
            'responsive': true,
            'language': {
                'url': '/js/dataTables.spanish.lang'
            }
        });
        sessionsTable = $('#sessions-list-table').DataTable({
            'responsive': true,
            'language': {
                'url': '/js/dataTables.spanish.lang'
            }
        });
    };

};

/**
 * Crea e inicializa el objeto Session_List
 * @method init
 */
Session_List.init = function () {
    var app = new Session_List();
    app.init();
};

$(Session_List.init);