router.get('/project/index', function (req, res, next) {
    showMsg('Loading project list...');
    server.invoke('GetProjects')
        .done(function (data) {
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    $('.open-project-outer').append('<div class="open-project-item"><div class="icon"><i class="fa fa-cloud"></i></div><div class="name">' + data[i].Project + '</div><div class="buttons"><a href="javascript:;" class="btn open" data-project="' + data[i].Project + '" data-git="' + data[i].Git + '" data-pwd="' + data[i].Password + '" data-usr="' + data[i].Name + '" data-email="' + data[i].Email + '"><i class="fa fa-folder-open"></i></a><a href="javascript:;" class="btn remove"><i class="fa fa-trash"></i></a></div></div>');
                }
                $('.project .open-project-item .open').click(function () {
                    showMsg("Loading project...");
                    var proj = $(this);
                    node.invoke('OpenProject', proj.attr('data-project'), proj.attr('data-git'), proj.attr('data-usr'), proj.attr('data-pwd'), proj.attr('data-email'))
                        .done(function (data) {
                            if (data.isSucceeded) {
                                showMsg("Starting OmniSharp Host...");
                                node.invoke('StartOmnisharp', proj.attr('data-project'))
                                    .done(function () {
                                        server.invoke('OpenProject', proj.attr('data-git'));
                                        jFlick.RedirectTo('~/work/index.html?project=' + proj.attr('data-project'));
                                    });
                            } else {
                                showMsg('An error occurred during loading the project. <br/> ' + data.msg, 3000);
                            }
                        });
                });
                hideMsg();
            } else {
                showMsg('No project found.', 3000);
            }
        });

    $('.project .header-center-item.create-project').click(function () {
        $('.project .body').addClass('hidden');
        $('.project .sidebar').addClass('hidden');
        $('.project .header-center-item').removeClass('active');
        $('.project .header-center-item.create-project').addClass('active');
        $('.project .sidebar.create-project').removeClass('hidden');
        $('.project .body.create-project').removeClass('hidden');
    });

    $('.project .header-center-item.open-project').click(function () {
        $('.project .body').addClass('hidden');
        $('.project .sidebar').addClass('hidden');
        $('.project .header-center-item').removeClass('active');
        $('.project .header-center-item.open-project').addClass('active');
        $('.project .sidebar.open-project').removeClass('hidden');
        $('.project .body.open-project').removeClass('hidden');
    });

    $('.create-project-item').click(function () {
        var dest = $(this).attr('data-type');
        $('.create-project-description').addClass('hidden');
        $('.create-project-description').hide();
        $('.' + dest).removeClass('hidden');
        $('.' + dest).show();
    });
});