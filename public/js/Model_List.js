/**
 * Description
 * @return
 */
Model_List = function () {

    /**
     * Description
     * @method init
     * @return 
     */
    this.init = function () {
        initModelsTable();
        $('#btn-delete-model').click(deleteModel);
        $('#delete-model-modal').on('hidden.bs.modal', function () {
            $('#btn-delete-model').attr('data-id', '');
            $('#btn-delete-model').attr('data-url', '');
            $('#modal-model-name').text('');
        });
        $('#delete-model-modal').on('shown.bs.modal', function () {
            $('#delete-model-modal').focus();
        });
        $('.alert .close').click(function () {
            $(this).parent().fadeOut('slow');
        });
    };

    /**
     * Description
     * @method initModelsTable
     * @return 
     */
    var initModelsTable = function () {
        $('#models-list-table').DataTable({
            'responsive': true,
            'language': {
                'url': '/js/dataTables.spanish.lang'
            }
        });
        $('a.delete-model').click(function (event) {
            event.preventDefault();
            $('.alert').hide();
            $('#delete-model-modal').modal('show');
            $('#modal-model-name').text($(this).attr('data-name'));
            $('#btn-delete-model').attr('data-id', $(this).attr('data-id'));
            $('#btn-delete-model').attr('data-url', $(this).attr('href'));
        });
        $('.panel.panel-default').show();
    };

    /**
     * Description
     * @method deleteModel
     * @return 
     */
    var deleteModel = function () {
        var onSuccess = function (response) {
            if (response.hasOwnProperty('success') && response.success) {
                $('#delete-model-modal').modal('hide');
                $('#delete-model-success').fadeIn('slow').fadeOut('slow').fadeIn('slow');
                $('.panel.panel-default').hide();
                $('#models-list-table-container').load('/model/list #models-list-table', initModelsTable);
            } else {
                onError();
            }
        };
        var onError = function (error) {
            $('#delete-model-modal').modal('hide');
            $('#delete-model-error').fadeIn('slow').fadeOut('slow').fadeIn('slow');
        };
        $.ajax({
            method: 'post',
            url: $(this).attr('data-url'),
            dataType: 'json',
            data: {'id': $(this).attr('data-id')},
            success: onSuccess,
            error: onError
        });
    };

};

/**
 * Description
 * @return
 * @method init
 * @return 
 */
Model_List.init = function () {
    var app = new Model_List();
    app.init();
};

$(Model_List.init);
