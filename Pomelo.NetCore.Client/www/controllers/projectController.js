function resizeOpenList(res)
{
    var count = parseInt($(window).width() / 202);
    res.find('.open-project-outer').outerWidth(count * 202);
}

router.get('/project/index', function (req, res, next) {
    // Responsive Design
    $(window).resize(function () {
        resizeOpenList(res);
    });
    resizeOpenList(res);
});