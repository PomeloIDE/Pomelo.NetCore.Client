router.get('/project/index', function (req, res, next) {
    $('.project .open-project-item .open').click(function () {
        showMsg("Loading...");
        var proj = $(this);
        node.invoke('OpenProject', proj.attr('data-project'), proj.attr('data-git'), proj.attr('data-usr'), proj.attr('data-email'), proj.attr('data-pwd'))
            .done(function (data) {
                if (data.isSucceeded) {
                    hideMsg();
                    jFlick.RedirectTo('~/work/index.html?project=' + proj.attr('data-project'));
                } else {
                    showMsg('An error occurred during loading the project. <br/> ' + data.msg, 3000);
                }
            });
    });

    $('.project .header-center-item.create-project').click(function () {
        $('.project .body').addClass('hidden');
        $('.project .sidebar').addClass('hidden');
        $('.project .header-center-item').removeClass('active');
        $('.project .header-center-item.create-project').addClass('active');
        $('.project .sidebar.create-project').removeClass('hidden');
        $('.project .body.create-project').removeClass('hidden');
    });

    $('.project .header-center-item.open-project').click(function () {
        $('.project .body').addClass('hidden');
        $('.project .sidebar').addClass('hidden');
        $('.project .header-center-item').removeClass('active');
        $('.project .header-center-item.open-project').addClass('active');
        $('.project .sidebar.open-project').removeClass('hidden');
        $('.project .body.open-project').removeClass('hidden');
    });
});