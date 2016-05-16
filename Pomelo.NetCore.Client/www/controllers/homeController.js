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

    // Side bar tab click events
    $('#tabWorking').click(function () {
        $('#tabWorking').addClass('active');
        $('#tabDirectory').removeClass('active');
        $('.sidebar-directory').hide();
        $('.sidebar-working').show();
    });

    $('#tabDirectory').click(function () {
        $('#tabDirectory').addClass('active');
        $('#tabWorking').removeClass('active');
        $('.sidebar-directory').show();
        $('.sidebar-working').hide();
    });
});