var editorDic = {};
var bash_id;
var bash_seq = 0;
var current_diff = [];
var langTools = ace.require('ace/ext/language_tools');
var omnisharpCompleter = {
    getCompletions: function (editor, session, pos, prefix, callback) {
        if (prefix.length == 0) { callback(null, []); return }
        node.invoke('AutoComplete', editor.pomelo.project, editor.pomelo.path, pos.row + 1, pos.column, prefix, editor.getValue())
            .done(function (data) {
                if (data.isSucceeded) {
                    var ret = [];
                    var autocomplete = JSON.parse(data.msg);
                    for (var i = 0; i < autocomplete.length; i++) {
                        ret.push({ name: autocomplete[i].DisplayText, value: autocomplete[i].CompletionText, score: 100, meta: autocomplete[i].ReturnType });
                    }
                    callback(null, ret);
                } else {
                    alert(data.msg);
                }
            });
    }
}
langTools.addCompleter(omnisharpCompleter);

function showUncommittedDiff(i)
{
    $('.changes tbody').html(current_diff[i]);
    $('.uncommitted-diff-item div').removeClass('active');
    $($('.uncommitted-diff-item')[i]).children('div').addClass('active');
}

function ExpandDirectoryTree(obj)
{
    if (!obj.dirName.display || obj.dirName.display == '.git' || obj.dirName.display == 'bin' || obj.dirName.display == 'obj')
        return "";
    var ret = '<ul>';
    for (var i = 0; i < obj.files.length; i++)
    {
        if (obj.files[i].path)
            ret += '<li><div class="file" data-path="' + obj.files[i].path + '"><i class="fa fa-file"></i> ' + obj.files[i].name + '</div></li>';
        else if (obj.files[i].dirName.display != '.git' && obj.files[i].dirName.display != 'bin' && obj.files[i].dirName.display != 'obj')
            ret += '<li><div class="folder" data-path="' + obj.files[i].dirName.full + '"><i class="fa fa-folder"></i> ' + obj.files[i].dirName.display + '</div></li>' + ExpandDirectoryTree(obj.files[i]);
    }
    return ret + '</ul>';
}

function RebuildDirectoryTree(project, callback)
{
    showMsg("Loading project file structures...");
    node.invoke('ListFolder', project, '')
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

            $('#tabWorking').click();
            $('.sidebar-working-item').removeClass('active');
            // 判断文件是否已经打开
            if (editorDic[file.attr('data-path')]) {
                $('.body.coding pre').hide();
                $('pre#' + editorDic[file.attr('data-path')].id).show();
                var items = $('.sidebar-working-item');
                for (var i = 0; i < items.length; i++) {
                    console.error($(items[i]).children('div').attr('data-path'), file.attr('data-path'), $(items[i]).children('div').attr('data-path') == file.attr('data-path'));
                    if ($(items[i]).children('div').attr('data-path') == file.attr('data-path')) {
                        $(items[i]).addClass('active');
                        $(items[i]).prependTo('.sidebar-working');
                    }
                }
            } else {
                showMsg('Loading file content...');
                // Add to working list
                var working_item = $('<div class="sidebar-working-item active" ><i class="fa fa-file"></i> <div data-display="' + file.text().trim() + '" data-path="' + file.attr('data-path') + '">' + file.text() + '</div></div>');
                working_item.click(function () {
                    file.click();
                });
                working_item.prependTo('.sidebar-working');
                node.invoke('ReadFile', project, file.attr('data-path'))
                    .done(function (data) {
                        if (data.isSucceeded) {
                            var id = jFlick.GenerateRandomString();
                            $('.body.coding').append('<pre id="' + id + '">' + data.msg + '</pre>');
                            // Create Ace Editor
                            var editor = ace.edit(id);
                            editor.setOptions({
                                enableBasicAutocompletion: false,
                                enableLiveAutocompletion: true
                            });
                            editor.pomelo = {};
                            editor.pomelo.path = file.attr('data-path');
                            editor.pomelo.project = project;
                            editor.setTheme("ace/theme/twilight");
                            editor.session.setMode("ace/mode/csharp");
                            // Editor events
                            editor.getSession().on('change', function () {
                                $('.sidebar-working-item.active div').html('*' + file.text());
                            });
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
        if (callback)
            callback();
        hideMsg();
    });
}

node.on('OnOutputDataReceived', function (pid, seq, msg) {
    // 如果是bash
    if (pid == bash_id) {
        $('.textbox-console.bash').val($('.textbox-console.bash').val() + msg);
        $('.textbox-console.bash').scrollTop($('.textbox-console.bash')[0].scrollHeight);
    } else {
        $('.textbox-console[data-process="' + pid + '"]').val($('.textbox-console[data-process="' + pid + '"]').val() + msg);
        $('.textbox-console[data-process="' + pid + '"]').scrollTop($('.textbox-console[data-process="' + pid + '"]')[0].scrollHeight);
    }
});

router.get('/work/index', function (req, res, next) {
    showMsg('Starting bash or cmd process...');
    node.invoke('RunBash')
        .done(function (data) {
            if (data.isSucceeded) {
                bash_id = data.pid;
            }
        });
    RebuildDirectoryTree(req.query.project);
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

        // Refresh local diff
        showMsg('Loading diff...');
        node.invoke('GetUncommitDiff', req.query.project)
            .done(function (data) {
                if (data.isSucceeded) {
                    $('.sidebar-changes-list').html('');
                    $('table.changes tbody').html('');
                    current_diff = [];
                    for (var i = 0; i < data.msg.length; i++) {
                        var stat = '';
                        var style = '';
                        current_diff[i] = data.msg[i].Diff;
                        if (data.msg[i].Type == 'Modification') {
                            stat = 'M';
                            style = 'modify';
                        }
                        else if (data.msg[i].Type == 'Deletion') {
                            stat = 'D';
                            style = 'delete';
                        }
                        else {
                            stat = 'A';
                            style = 'add';
                        }
                        $('.sidebar-changes-list').append('<a class="uncommitted-diff-item" href="javascript:showUncommittedDiff(' + i + ');"><div class="sidebar-changes-list-item"><span class="' + style + '">' + stat + '</span> ' + (data.msg[i].NewFilename == data.msg[i].OldFilename ? data.msg[i].OldFilename : data.msg[i].OldFilename + ' -> ' + data.msg[i].NewFilename) + '</div></a>');
                    }
                    if (data.msg.length > 0) {
                        $($('.uncommitted-diff-item')[0]).click();
                    }
                    hideMsg();
                } else {
                    $('#tabWorking').click();
                    showMsg('An error occurred while loading diff. <br />' + data.msg, 1000);
                }
            });
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

        showMsg('Loading git logs...')
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

        node.invoke('GetGitLogs', req.query.project)
            .done(function (data) {
                if (data.isSucceeded) {
                    $('.sidebar-histories').html('');
                    $('.histories').html('');
                    for (var i = 0; i < data.logs.length; i++) {
                        var history_item = $('<div class="sidebar-histories-item" data-hash="' + data.logs[i].Hash + '"><img src="http://gravatar.com/avatar/' + md5(data.logs[i].Email) + '?s=200&d=mm&r=g" class="avatar" /><div class="info"><div class="summary">' + data.logs[i].Summary + '</div><div class="hint">' + moment(data.logs[i].Datetime * 1000).fromNow() + ' by ' + data.logs[i].Author + '</div></div></div>');
                        history_item.click(function () {
                            $('.sidebar-histories-item').removeClass('active');
                            $(this).addClass('active');
                            showMsg('Loading commit diffs...');
                            node.invoke('GetGitDiff', req.query.project, $(this).attr('data-hash'))
                                .done(function (data) {
                                    if (data.isSucceeded) {
                                        $('.body.git .histories').html('');
                                        for (var j = 0; j < data.msg.length; j++) {
                                            $('.body.git .histories').append('<div class="item">' + (data.msg[j].NewFilename == data.msg[j].OldFilename ? data.msg[j].OldFilename : data.msg[j].OldFilename + ' -> ' + data.msg[j].NewFilename) + '</div>');
                                            $('.body.git .histories').append('<table><colgroup><col /><col /><col /></colgroup><tbody>' + data.msg[j].Diff + '</tbody></table>');
                                        }
                                        hideMsg();
                                    } else {
                                        showMsg('An error occurred while loading commit diffs. <br />' + data.msg, 3000);
                                    }
                                });
                        });
                        $('.sidebar-histories').append(history_item);
                    }
                    hideMsg();
                } else {
                    showMsg('An error occurred while loading git logs.', 3000);
                }
            });
    });

    // Save button click
    $('.button.save').click(function () {
        var path = $('.sidebar-working-item.active div').attr('data-path');
        var content = editorDic[path].editor.getValue();
        showMsg('Saving...');
        node.invoke('WriteFile', req.query.project, path, content)
            .done(function (data) {
                if (data.isSucceeded) {
                    $('.sidebar-working-item.active div').html($('.sidebar-working-item.active div').attr('data-display'));
                    showMsg('The file ' + $('.sidebar-working-item.active div').attr('data-display') + ' has been saved successfully.', 1000);
                } else {
                    showMsg('An error occurred while saving the file. <br />' + data.msg, 3000);
                }
            });
    });

    // Remove button click
    $('.tool-remove').click(function () {
        var path = $('.sidebar-directory-tree .file.active').attr('data-path');
        var display = $('.sidebar-directory-tree .file.active').text();
        var isFile = $('.sidebar-directory-tree .file.active i').hasClass('fa-file');
        if (isFile) {
            if (confirm('Do you want to remove this file?')) {
                showMsg('Removing ' + display);
                node.invoke('RemoveFile', req.query.project, path)
                    .done(function (data) {
                        if (data.isSucceeded) {
                            $('.sidebar-directory-tree .file.active').parent().remove();
                            $('.sidebar-working-item.active').remove();
                            showMsg('The file ' + display + ' has been removed successfully.', 1000);
                        } else {
                            showMsg('An error occurred while removing file. <br />' + data.msg, 3000);
                        }
                    });
            }
        } else {
            if (confirm('Do you want to remove this folder and remove the sub files?')) {
                showMsg('Removing ' + display);
                node.invoke('RemoveFolder', req.query.project, path)
                    .done(function (data) {
                        if (data.isSucceeded) {
                            $('.sidebar-directory-tree .folder.active').parent().remove();
                            var tmp = $('.sidebar-working-item');
                            for (var i = 0; i < tmp.length; i++) {
                                if ($(tmp[i]).children('div').attr('data-path').indexOf(path) >= 0) {
                                    $(tmp[i]).remove();
                                }
                            }
                            showMsg('The folder ' + display + ' has been removed successfully.', 1000);
                        } else {
                            showMsg('An error occurred while removing file. <br />' + data.msg, 3000);
                        }
                    });
            }
        }
    });

    // Rename button click
    $('.tool-rename').click(function () {
        var path = $('.sidebar-directory-tree .active').attr('data-path');
        var display = $('.sidebar-directory-tree .active').text().trim();
        var isFile = $('.sidebar-directory-tree .active i').hasClass('fa-file');
        var new_name = prompt("Input a new name", display);
        if (isFile) {
            var index = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
            var iswin = path.lastIndexOf('\\') > path.lastIndexOf('/');
            var folder = index > 0 ? path.substr(0, index).trim() : path;
            showMsg('Renaming file ' + display + '...');
            node.invoke('RenameFile', req.query.project, folder, display, new_name)
                .done(function (data) {
                    if (data.isSucceeded) {
                        $('.sidebar-directory-tree .file.active').attr('data-path', (folder ? folder + (iswin ? '\\' : '/') : '') + new_name);
                        $('.sidebar-directory-tree .file.active').html('<i class="fa fa-file"></i> ' + new_name);
                        var tmp = $('.sidebar-working-item');
                        for (var i = 0; i < tmp.length; i++) {
                            if ($(tmp[i]).children('div').attr('data-path') == path) {
                                $(tmp[i]).children('div').attr('data-path', $('.sidebar-directory-tree .file.active').attr('data-path'));
                                $(tmp[i]).children('div').attr('data-display', new_name);
                                $(tmp[i]).children('div').text($(tmp[i]).children('div').text().replace(display, new_name));
                            }
                        }
                        showMsg('File ' + display + ' has been renamed to ' + new_name + ' successfully.', 1000);
                    } else {
                        showMsg('An error occurred while renaming file. <br />' + data.msg, 3000);
                    }
                });
        } else {
            var index = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
            var iswin = path.lastIndexOf('\\') > path.lastIndexOf('/');
            var basefolder = index > 0 ? path.substr(0, index) : path;
            showMsg('Renaming folder ' + display + '...');
            node.invoke('RenameFolder', req.query.project, basefolder, display, new_name)
                .done(function (data) {
                    if (data.isSucceeded) {
                        $('.sidebar-directory-tree .folder.active').attr('data-path', (folder ? folder + (iswin ? '\\' : '/') : '') + new_name);
                        $('.sidebar-directory-tree .folder.active').html('<i class="fa fa-folder"></i> ' + new_name);
                        var tmp = $('.sidebar-directory-tree .file');
                        for (var i = 0; i < tmp.length; i++) {
                            if ($(tmp[i]).attr('data-path').indexOf(path) >= 0) {
                                $(tmp[i]).attr('data-path', $(tmp).attr('data-path').replace(path, $('.sidebar-directory-tree .folder.active').attr('data-path')));
                            }
                        }
                        var tmp2 = $('.sidebar-working-item');
                        for (var i = 0; i < tmp2.length; i++) {
                            if ($(tmp[i]).children('div').attr('data-path').indexOf(path) >= 0) {
                                $(tmp[i]).children('div').attr('data-path', $(tmp[i]).children('div').attr('data-path').replace(path, $('.sidebar-directory-tree .folder.active').attr('data-path')));
                            }
                        }
                        showMsg('Folder ' + display + ' has been renamed to ' + new_name + ' successfully.', 1000);
                    } else {
                        showMsg('An error occurred while renaming folder. <br />' + data.msg, 3000);
                    }
                });
        }
    });

    // Create folder
    $('.tool-new-folder').click(function () {
        var foldername = prompt("Folder name", "");
        var path = $('.sidebar-directory-tree .active').length == 0 ? "" : $('.sidebar-directory-tree .active').attr('data-path');
        if ($('.sidebar-directory-tree .active').hasClass('file')) {
            path = $('.sidebar-directory-tree .active').attr('data-path').replace($('.sidebar-directory-tree .active').text().trim(), '');
        }
        node.invoke('CreateFolder', req.query.project, path, foldername)
            .done(function (data) {
                if (data.isSucceeded) {
                    RebuildDirectoryTree(req.query.project, function () {
                        $('.sidebar-directory-tree [data-path="' + data.path + '"]').parent().click();
                    });
                } else {
                    showMsg('An error occurred while renaming folder. <br />' + data.msg, 3000);
                }
            });
    });

    // Create file
    $('.tool-new-file').click(function () {
        var name = prompt("File name", "");
        var path = $('.sidebar-directory-tree .active').length > 0 ? $('.sidebar-directory-tree .active').attr('data-path') : "";
        if ($('.sidebar-directory-tree .active').hasClass('file')) {
            path = $('.sidebar-directory-tree .active').attr('data-path').replace($('.sidebar-directory-tree .active').text().trim(), '');
        }
        node.invoke('CreateFile', req.query.project, path, name)
            .done(function (data) {
                if (data.isSucceeded) {
                    RebuildDirectoryTree(req.query.project, function () {
                        $('.sidebar-directory-tree [data-path="' + data.path + '"]').parent().click();
                    });
                } else {
                    showMsg('An error occurred while renaming folder. <br />' + data.msg, 3000);
                }
            });
    });

    // Git Commit
    $('.btn-git-commit').click(function () {
        if (!$('.txt-git-commit-summary').val()) {
            showMsg('Commit summary cannot be empty.', 3000);
            return;
        }
        var summary = $('.txt-git-commit-summary').val();
        var description = $('.commit-description').val();
        showMsg('Creating commit...');
        node.invoke('CreateGitCommit', req.query.project, summary, description)
            .done(function (data) {
                if (data.isSucceeded) {
                    showMsg('Pushing to remote server...');
                    node.invoke('CreateGitPush', req.query.project)
                        .done(function (data) {
                            if (data.isSucceeded) {
                                $('.header-center-item.git').click();
                                $('.txt-git-commit-summary').val('');
                                $('.commit-description').val('');
                            } else {
                                showMsg('An error occurred while pushing commit to remote server. <br />' + data.msg, 3000);
                            }
                        });
                } else {
                    showMsg('An error occurred while creating commit. <br />' + data.msg, 3000);
                }
            });
    });

    // Bash text area
    $('.textbox-console.bash').keypress(function (e) {
        node.invoke('ConsoleWrite', bash_id, ++bash_seq, e.which);
    });

    // Run button event 
    $('.button.button-run').click(function () {
        showMsg('Finding projects...');
        node.invoke('GetProjectInfo', req.query.project)
            .done(function (data) {
                if (data.isSucceeded) {
                    if (data.projects.length == 0) {
                        showMsg('No project found.', 3000);
                    } else {
                        $('.project-selector table').html('');
                        for (var i = 0; i < data.projects.length; i++) {
                            $('.project-selector table').append('<tr data-path="' + data.projects[i].Path + '"><td>' + data.projects[i].Title + '</td><td>dotnet run</td><td><input type="text" class="textbox" /></td><td><div class="button button-run-command"><i class="fa fa-play"></i></div></td></tr>');
                        }
                        $('.project-selector').removeClass('project-selector-hidden');
                        hideMsg();
                    }
                } else {
                    showMsg('An error occurred while finding projects. <br />' + data.msg, 3000);
                }
            });
    });
});