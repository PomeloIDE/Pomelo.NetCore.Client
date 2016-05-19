router.global.popping(function (req, top, bottom, next, final) {
    if (next)
        next();
    if (final)
        final();
    return;
});

router.global.popped(function (req, top, bottom, next) {
    top.remove();
    bottom.removeClass('hidden');
    if (next)
        next();
});

router.global.loading(function (req, top, bottom, next, final) {
    if (next)
        next();
    final();
});

router.global.loaded(function (req, top, bottom, next) {
    top.appendTo('body');
    top.removeClass('hidden');
    bottom.addClass('hidden');
    if (next)
        next();
});