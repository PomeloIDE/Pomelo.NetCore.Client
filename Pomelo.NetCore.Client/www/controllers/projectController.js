router.get('/project/index', function (req, res, next) {
    res.find('.buttons .btn.open').click(function () {
        jFlick.RedirectTo('~/work/index.html');
    });
});