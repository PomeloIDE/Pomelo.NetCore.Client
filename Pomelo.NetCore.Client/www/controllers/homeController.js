function resizeLoginDiv(res)
{
    res.find('.login').css('margin-top', $(window).height()  * 3 / 7 - res.find('.login').height() / 2);
}

router.get('/home/index', function (req, res, next) {
    // Responsive Design
    $(window).resize(function () {
        resizeLoginDiv(res);
    });
    resizeLoginDiv(res);

    // Binding Sign in Event
    res.find('#btnSignIn').click(function () {
        // TODO: Sign In
        jFlick.RedirectTo("~/project/index.html");
    });
});