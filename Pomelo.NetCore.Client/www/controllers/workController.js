var editorDic = {};

function ExpandDirectoryTree(obj)
{
    if (!obj.dirName || obj.dirName == '.git')
        return "";
    var ret = '<ul>';
    for (var i = 0; i < obj.files.length; i++)
    {
        if (obj.files[i].path)
            ret += '<li><div class="file" data-path="' + obj.files[i].path + '"><i class="fa fa-file"></i> ' + obj.files[i].name + '</div></li>';
        else if (obj.files[i].dirName != '.git') 
            ret += '<li><div class="folder" data-path=""><i class="fa fa-folder"></i> ' + obj.files[i].dirName + '</div></li>' + ExpandDirectoryTree(obj.files[i]);
    }
    return ret + '</ul>';
}

router.get('/work/index', function (req, res, next) {
    showMsg("Loading project file structures...");
    node.invoke('ListFolder', req.query.project, '')
        .done(function (data) {
            $('.work .sidebar .sidebar-directory-tree').html('');
            $('.sidebar-working').html('');
            var tree = ExpandDirectoryTree(data.msg);
            $('.work .sidebar .sidebar-directory-tree').html(tree);
            $('.sidebar-directory-tree div.folder').click(function () {
                $('.sidebar-directory-tree div.folder').removeClass('active');
                $('.sidebar-directory-tree div.file').removeClass('active');
                $(this).addClass('active');
            });
            $('.sidebar-directory-tree div.file').click(function () {
                $('.sidebar-directory-tree div.folder').removeClass('active');
                $('.sidebar-directory-tree div.file').removeClass('active');
                var file = $(this);
                file.addClass('active');

                // Add to working list
                $('.sidebar-working-item').removeClass('active');
                if ($('.sidebar-working-item div[data-path="' + file.attr('data-path') + '"]').length > 0) {
                    $('.sidebar-working-item div[data-path="' + file.attr('data-path') + '"]').parent('.sidebar-working-item').prependTo('.sidebar-working');
                    $('.sidebar-working-item div[data-path="' + file.attr('data-path') + '"]').parent('.sidebar-working-item').addClass('active');
                } else {
                    var working_item = $('<div class="sidebar-working-item active" ><i class="fa fa-file"></i> <div data-display="' + file.text() + '" data-path="' + file.attr('data-path') + '">' + file.text() + '</div></div>');
                    working_item.click(function () {
                        file.click();
                    });
                    working_item.prependTo('.sidebar-working');
                }

                $('#tabWorking').click();
                // 判断文件是否已经打开
                if (editorDic[file.attr('data-path')]) {
                    $('.body.coding pre').hide();
                    $('pre#' + editorDic[file.attr('data-path')].id).show();
                } else {
                    showMsg('Loading file content...');
                    node.invoke('ReadFile', req.query.project, file.attr('data-path'))
                        .done(function (data) {
                            if (data.isSucceeded) {
                                var id = jFlick.GenerateRandomString();
                                $('.body.coding').append('<pre id="' + id + '">' + data.msg + '</pre>');
                                var editor = ace.edit(id);
                                editor.setTheme("ace/theme/twilight");
                                editor.session.setMode("ace/mode/csharp");
                                editorDic[file.attr('data-path')] = { editor: editor, id: id };
                                $('.body.coding pre').hide();
                                $('#' + editorDic[file.attr('data-path')].id).show();
                                hideMsg();
                            } else {
                                $('.sidebar-working-item div[data-path="' + file.attr('data-path') + '"]').parent('.sidebar-working-item').remove();
                                showMsg('An error occurred while reading file. <br />' + data.msg, 3000);
                            }
                        });
                }
            });
            hideMsg();
        });

    // Navigator bar click events
    $('.work .header-center-item.coding').click(function () {
        $('.work .body').addClass('hidden');
        $('.work .sidebar').addClass('hidden');
        $('.work .header-center-item').removeClass('active');
        $('.work .header-center-item.coding').addClass('active');
        $('.work .sidebar.coding').removeClass('hidden');
        $('.work .body.coding').removeClass('hidden');
    });

    $('.work .header-center-item.git').click(function () {
        $('.work .body').addClass('hidden');
        $('.work .sidebar').addClass('hidden');
        $('.work .header-center-item').removeClass('active');
        $('.work .header-center-item.git').addClass('active');
        $('.work .sidebar.git').removeClass('hidden');
        $('.work .body.git').removeClass('hidden');
    });

    $('.work .header-center-item.browser').click(function () {
        $('.work .body').addClass('hidden');
        $('.work .sidebar').addClass('hidden');
        $('.work .header-center-item').removeClass('active');
        $('.work .header-center-item.browser').addClass('active');
        $('.work .sidebar.browser').removeClass('hidden');
        $('.work .body.browser').removeClass('hidden');
    });

    $('.work .header-center-item.console').click(function () {
        $('.work .body').addClass('hidden');
        $('.work .sidebar').addClass('hidden');
        $('.work .header-center-item').removeClass('active');
        $('.work .header-center-item.console').addClass('active');
        $('.work .sidebar.console').removeClass('hidden');
        $('.work .body.console').removeClass('hidden');

        // Addition events
        $('#txtConsole').focus();
    });

    $('.work .header-center-item.ssh').click(function () {
        $('.work .body').addClass('hidden');
        $('.work .sidebar').addClass('hidden');
        $('.work .header-center-item').removeClass('active');
        $('.work .header-center-item.ssh').addClass('active');
        $('.work .body.ssh').removeClass('hidden');

        // Addition events
        $('#txtSsh').focus();
    });

    // Side bar tab click events
    $('#tabWorking').click(function () {
        $('#tabWorking').addClass('active');
        $('#tabDirectory').removeClass('active');
        $('.work .sidebar-directory').hide();
        $('.work .sidebar-directory').addClass('hidden');
        $('.work .sidebar-working').show();
        $('.work .sidebar-working').removeClass('hidden');
    });

    $('#tabDirectory').click(function () {
        $('#tabDirectory').addClass('active');
        $('#tabWorking').removeClass('active');
        $('.work .sidebar-directory').show();
        $('.work .sidebar-directory').removeClass('hidden');
        $('.work .sidebar-working').hide();
        $('.work .sidebar-working').addClass('hidden');
    });

    $('#tabChanges').click(function () {
        $('#tabChanges').addClass('active');
        $('#tabHistories').removeClass('active');
        $('.work .sidebar-histories').hide();
        $('.work .sidebar-histories').addClass('hidden');
        $('.work .sidebar-changes').show();
        $('.work .sidebar-changes').removeClass('hidden');
        $('.work .body.git .changes').show();
        $('.work .body.git .changes').removeClass('hidden');
        $('.work .body.git .histories').hide();
        $('.work .body.git .histories').addClass('hidden');
    });

    $('#tabHistories').click(function () {
        $('#tabHistories').addClass('active');
        $('#tabChanges').removeClass('active');
        $('.work .sidebar-histories').show();
        $('.work .sidebar-histories').removeClass('hidden');
        $('.work .sidebar-changes').hide();
        $('.work .sidebar-changes').addClass('hidden');
        $('.work .body.git .histories').show();
        $('.work .body.git .histories').removeClass('hidden');
        $('.work .body.git .changes').hide();
        $('.work .body.git .changes').addClass('hidden');
    });
});