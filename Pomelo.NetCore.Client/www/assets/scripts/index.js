nodeConn = $.hubConnection('http://52.196.105.20:50556');
var node = nodeConn.createHubProxy('PomeloHub');

function showMsg(txt, time)
{
    $('.container').addClass('blur');
    $('.msg .txt').html(txt);
    $('.msg').outerWidth($(window).width());
    $('.msg').outerHeight($(window).height());
    $('.msg').removeClass('hidden');
    $('.msg .txt').css('margin-top', $(window).height() / 2 - $('.txt').outerHeight() / 2);
    if (time)
        setTimeout(function () { hideMsg(); }, time);
}

function hideMsg()
{
    $('.msg').addClass('hidden');
    $('.container').removeClass('blur');
}

(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        StatusBar.styleLightContent();

        nodeConn.start()
            .done(function () {
                jFlick.Startup();
            });
    };

    function onPause() {
    };

    function onResume() {
    };
})();