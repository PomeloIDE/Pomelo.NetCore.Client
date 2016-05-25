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
        showMsg('Signing in & opening VM...');
        server.invoke('SignIn', $('#txtUsername').val(), $('#txtPassword').val())
            .done(function (data) {
                if (data.IsSucceeded) {
                    nodeip = data.VMIP;
                    nodeConn = $.hubConnection('http://' + serverip + ':50556');
                    node = nodeConn.createHubProxy('PomeloHub');
                    nodeConn.start().done(function () {
                        jFlick.RedirectTo("~/project/index.html");
                    });
                } else {
                    showMsg('An error occurred while signing in and opening VM.', 3000);
                }
            });
    });
});