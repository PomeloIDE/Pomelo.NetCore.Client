'use strict'
/* Define jFlick */
var jFlick = {};
jFlick.__performance = null;
jFlick.ViewStack = [];

/* Routing */
var router = {};
router.global = {};
router.global.onloading = [];
router.global.onloaded = [];
router.global.onpopping = [];
router.global.onpopped = [];
router.global.onredirecting = [];
router.onloaded = {};
router.onpopping = {};
router.onloading = {};
router.onpopped = {};

router.use = function (func) {
    if (!func) return;
    router.global.loading(function (req, top, bottom, next) {
        func(req, top, next);
    });
};

router.get = function (path, func) {
    if (!path || !func) return;
    if (!router.onloaded[path])
        router.onloaded[path] = [];
    router.onloaded[path].push(function (req, top, bottom, next) {
        func(req, top, next);
    });
};

router.loaded = function (path, func) {
    if (!path || !func) return;
    if (!router.onloaded[path])
        router.onloaded[path] = [];
    router.onloaded[path].push(func);
};

router.loading = function (path, func) {
    if (!path || !func) return;
    if (!router.onloading[path])
        router.onloading[path] = [];
    router.onloading[path].push(func);
};

router.popping = function (path, func) {
    if (!path || !func) return;
    if (!router.onpopping[path])
        router.onpopping[path] = [];
    router.onpopping[path].push(func);
};

router.popped = function (path, func) {
    if (!path || !func) return;
    if (!router.onpopped[path])
        router.onpopped[path] = [];
    router.onpopped[path].push(func);
};

router.global.loading = function (func) {
    if (!func) return;
    router.global.onloading.push(func);
};

router.global.loaded = function (func) {
    if (!func) return;
    router.global.onloaded.push(func);
};

router.global.popping = function (func) {
    if (!func) return;
    router.global.onpopping.push(func);
};

router.global.popped = function (func) {
    if (!func) return;
    router.global.onpopped.push(func);
};

router.global.redirecting = function (func) {
    if (!func) return;
    router.global.onredirecting.push(func);
};

jFlick.OnLoading = function (i, req, top, bottom, final) {
    if (!router.global.onloading[i])
        return jFlick.__OnLoading(0, req, top, bottom);
    return function () {
        router.global.onloading[i](req, top, bottom, jFlick.OnLoading(i + 1, req, top, bottom, final), final);
    };
};

jFlick.__OnLoading = function (i, req, top, bottom) {
    var key = jFlick.GetPath(document.location.toString());
    if (!router.onloading[key] || !router.onloading[key][i])
        return function () { };
    return function () {
        router.onloading[key][i](req, top, bottom, jFlick.__OnLoading(key, i + 1, req, top, bottom));
    };
};

jFlick.OnLoaded = function (i, req, top, bottom) {
    if (!router.global.onloaded[i])
        return jFlick.__OnLoaded(0, req, top, bottom);
    return function () {
        router.global.onloaded[i](req, top, bottom, jFlick.OnLoaded(i + 1, req, top, bottom));
    };
};

jFlick.__OnLoaded = function (i, req, top, bottom) {
    var key = jFlick.GetPath(document.location.toString());
    if (!router.onloaded[key] || !router.onloaded[key][i])
        return function () { };
    return function () {
        router.onloaded[key][i](req, top, bottom, jFlick.__OnLoaded(key, i + 1, req, top, bottom));
    };
};

jFlick.OnPopping = function (i, req, top, bottom, final) {
    if (!router.global.onpopping[i])
        return jFlick.__OnPopping(0, req, top, bottom);
    return function () {
        router.global.onpopping[i](req, top, bottom, jFlick.OnPopping(i + 1, req, top, bottom, final), final);
    };
};

jFlick.__OnPopping = function (i, req, top, bottom) {
    var key = jFlick.GetPath(document.location.toString());
    if (!router.onpopping[key] || !router.onpopping[key][i])
        return function () { };
    return function () {
        router.onpopping[key][i](req, top, bottom, jFlick.__OnPopping(key, i + 1, req, top, bottom));
    };
};

jFlick.OnPopped = function (i, req, top, bottom) {
    if (!router.global.onpopped[i])
        return jFlick.__OnPopped(0, req, top, bottom);
    return function () {
        router.global.onpopped[i](req, top, bottom, jFlick.OnPopping(i + 1, req, top, bottom));
    };
};

jFlick.__OnPopped = function (i, req, top, bottom) {
    var key = jFlick.GetPath(document.location.toString());
    if (!router.onpopped[key] || !router.onpopped[key][i])
        return function () { };
    return function () {
        router.onpopped[key][i](req, top, bottom, jFlick.__OnPopped(key, i + 1, req, top, bottom));
    };
};

/* Parameters analyzing */
jFlick.AnalyzingParams = function () {
    var req = {};
    req.query = jFlick.AnalyzingGetParams();
    req.form = jFlick.AnalyzingPostParams();
    return req;
};

jFlick.AnalyzingGetParams = function () {
    var params = {};
    var search = window.location.search;
    search = search.substring(1);
    var tmp = search.split('&');
    for (var i = 0; i < tmp.length; i++) {
        try {
            var tmp2 = tmp[i].split('=');
            params[decodeURIComponent(tmp2[0])] = decodeURIComponent(tmp2[1]);
        }
        catch (ex) { }
    }
    return params;
};

jFlick.AnalyzingPostParams = function () {
    var params = {};
    return params;
};

/* Startup */
jFlick.Startup = function () {
    var tmp = document.location.toString();
    jFlick.webRootPath = tmp.substr(0, tmp.indexOf('/index.html'));

    var frm = document.createElement('iframe');
    frm.setAttribute('id', jFlick.GenerateRandomString());
    frm.setAttribute('class', 'jflick-pool');
    frm.src = jFlick.webRootPath + '/views/_viewStart.json.html';
    frm.onload = function () {
        try {
            var viewStart = JSON.parse($(frm).contents().find('body').html());
            frm.parentNode.removeChild(frm);
            jFlick.RedirectTo(jFlick.ParseUrl(viewStart.home), 'no');
            jFlick.__init = true;
        } catch (ex) {
        }
    };
    document.body.appendChild(frm);
};

/* Parse URL */
jFlick.ParseUrl = function (url) {
    if (url[0] == '~')
        url = jFlick.webRootPath + '/views' + url.substr(1, url.length - 1);
    else if (url[0] == '%')
        url = jFlick.webRootPath + '/controllers' + url.substr(1, url.length - 1);
    else if (url[0] == '@')
        url = jFlick.webRootPath + url.substr(1, url.length - 1);
    return url.toString();
}

/* Back */
jFlick.Back = function () {
    if (history.state == null)
        return;
    history.go(-1);
}

/* Pop view */
jFlick.PopView = function () {
    if ($('.container').length <= 1) return false;
    var current = $($('.container')[$('.container').length - 1]);
    var covered = $($('.container')[$('.container').length - 2]);
    var popping = jFlick.OnPopping(0, jFlick.AnalyzingParams(), current, covered, jFlick.OnPopped(0, jFlick.AnalyzingParams(), current, covered));
    if (popping)
        popping();
    return true;
}

/* Redirect to */
jFlick.RedirectTo = function (url, performance) {
    url = jFlick.ParseUrl(url);
    var frm = document.createElement('iframe');
    frm.setAttribute('id', jFlick.GenerateRandomString());
    frm.setAttribute('class', 'jflick-pool');
    frm.src = url;
    frm.onload = function () {
        if (!url) return;
        if (typeof (performance) == 'undefined')
            performance = 'slide';
        window.history.pushState({ url: url, performance: performance }, '', url);
        jFlick.__performance = history.state.performance;
        var tmp = $(frm).contents().find('.container')[0];
        var container = $(tmp);
        frm.parentNode.removeChild(frm);
        container.attr('id', jFlick.GenerateRandomString());
        var covered = $($('.container')[$('.container').length - 1]);
        container.attr('data-url', url);

        // 运行中间件
        var loading = jFlick.OnLoading(0, jFlick.AnalyzingParams(), container, covered, jFlick.OnLoaded(0, jFlick.AnalyzingParams(), container, covered));
        if (loading)
            loading();
    };
    document.body.appendChild(frm);
}

jFlick.GetPath = function (url) {
    url = url.substring(url.indexOf('/views') + 6);
    url = url.substring(0, url.lastIndexOf('.'));
    return url;
};

$(document).ready(function () {
    $(document).unbind('click').on('click', function (e) {
        var a;
        if ($(e.target).is('a'))
            a = $(e.target);
        else {
            a = $(e.target).parents('a');
        }
        if (a.is('a') && a.attr('href').toString().indexOf('javascript') >= 0) {
            return true;
        }
        if (a.is('a') && a.attr('href')[0] != '#' && a.attr('href').toString().indexOf('//') < 0 && a.attr('href').toString().indexOf('http') < 0) {
            jFlick.RedirectTo(a.attr('href'), a.attr('data-performance'));
            e.preventDefault();
            return false;
        }
    });
    window.onpopstate = function (e) {
        if (jFlick.__init) {
            jFlick.PopView();
            if (history.state)
                jFlick.__performance = history.state.performance;
            return false;
        }
    };
});

jFlick.RegisterSwitchery = function (container) {
    var elem = container.find('input[type="checkbox"]');
    for (var i = 0; i < elem.length; i++) {
        var init = new Switchery(elem[i]);
    }
};

jFlick.GenerateRandomString = function (len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var pwd = '';
    for (var i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
};

jFlick.GetView = function (index) {
    if (!index) index = 0;
    return $($('.container')[$('.container').length - index - 1]);
}