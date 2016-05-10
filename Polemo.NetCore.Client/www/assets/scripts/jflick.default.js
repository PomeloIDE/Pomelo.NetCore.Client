router.global.popping(function (req, top, bottom, next, final) {
    next();
    if (final)
        final();
    return;
});

router.global.popped(function (req, top, bottom, next) {
    top.remove();
    next();
});

router.global.loading(function (req, top, bottom, next, final) {
    next();
    final();
});

router.global.loaded(function (req, top, bottom, next) {
    console.log(top[0].outerHTML);
    top.appendTo('body');
    next();
});