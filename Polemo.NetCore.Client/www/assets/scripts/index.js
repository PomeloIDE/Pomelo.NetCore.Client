(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        jFlick.Startup();
        StatusBar.styleLightContent();
    };

    function onPause() {
    };

    function onResume() {
    };
})();