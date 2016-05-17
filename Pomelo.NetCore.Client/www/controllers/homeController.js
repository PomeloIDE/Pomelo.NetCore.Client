router.get('/home/index', function (req, res, next) {
    // Ace editor
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/csharp");

    // Navigator bar click events
    $('.header-center-item.coding').click(function () {
        $('.body').addClass('hidden');
        $('.sidebar').addClass('hidden');
        $('.header-center-item').removeClass('active');
        $('.header-center-item.coding').addClass('active');
        $('.sidebar.coding').removeClass('hidden');
        $('.body.coding').removeClass('hidden');
    });
    $('.header-center-item.git').click(function () {
        $('.body').addClass('hidden');
        $('.sidebar').addClass('hidden');
        $('.header-center-item').removeClass('active');
        $('.header-center-item.git').addClass('active');
        $('.sidebar.git').removeClass('hidden');
        $('.body.git').removeClass('hidden');
    });

    // Side bar tab click events
    $('#tabWorking').click(function () {
        $('#tabWorking').addClass('active');
        $('#tabDirectory').removeClass('active');
        $('.sidebar-directory').hide();
        $('.sidebar-directory').addClass('hidden');
        $('.sidebar-working').show();
        $('.sidebar-working').removeClass('hidden');
    });

    $('#tabDirectory').click(function () {
        $('#tabDirectory').addClass('active');
        $('#tabWorking').removeClass('active');
        $('.sidebar-directory').show();
        $('.sidebar-directory').removeClass('hidden');
        $('.sidebar-working').hide();
        $('.sidebar-working').addClass('hidden');
    });

    $('#tabChanges').click(function () {
        $('#tabChanges').addClass('active');
        $('#tabHistories').removeClass('active');
        $('.sidebar-histories').hide();
        $('.sidebar-histories').addClass('hidden');
        $('.sidebar-changes').show();
        $('.sidebar-changes').removeClass('hidden');
        $('.body.git .changes').show();
        $('.body.git .changes').removeClass('hidden');
        $('.body.git .histories').hide();
        $('.body.git .histories').addClass('hidden');
    });

    $('#tabHistories').click(function () {
        $('#tabHistories').addClass('active');
        $('#tabChanges').removeClass('active');
        $('.sidebar-histories').show();
        $('.sidebar-histories').removeClass('hidden');
        $('.sidebar-changes').hide();
        $('.sidebar-changes').addClass('hidden');
        $('.body.git .histories').show();
        $('.body.git .histories').removeClass('hidden');
        $('.body.git .changes').hide();
        $('.body.git .changes').addClass('hidden');
    });
});