/**
 * Description
 * @return
 * @return 
 */
Session_List = function () {

    /**
     * Description
     * @return
     * @method init
     * @return 
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
        });
        $('#action-cancel-new-session').click();
    };

    /**
     * Description
     * @method initDataTables
     * @return 
     */
    var initDataTables = function () {
        $('#session-list-table').DataTable({
            'responsive': true,
            'language': {
                'url': '/js/dataTables.spanish.lang'
            }
        });
        $('#models-list-table').DataTable({
            'responsive': true,
            'language': {
                'url': '/js/dataTables.spanish.lang'
            }
        });
    };

};

/**
 * Description
 * @return
 * @method init
 * @return 
 */
Session_List.init = function () {
    var app = new Session_List();
    app.init();
};

$(Session_List.init);