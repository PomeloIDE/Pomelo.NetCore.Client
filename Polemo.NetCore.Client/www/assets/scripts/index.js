(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        StatusBar.styleLightContent();
        jFlick.Startup();
    };

    function onPause() {
    };

    function onResume() {
    };
})();