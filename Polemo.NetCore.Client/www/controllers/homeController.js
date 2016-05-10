router.get('/home/index', function (req, res, next) {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/csharp");
});