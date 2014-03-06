require(['sui'],function(S){

    $('#click-me').click(function(){
        new S.Dialog({
            content:'<p style="width:300px;padding:50px;">test</p>'
        });
    });

    $('#no-title').click(function(){
        new S.Dialog({
            content:'<p style="width:300px;padding:50px;">test</p>',
            title: false
        });
    });

    $('#ajax-dialog').click(function(){
        S.Dialog.ajaxDialog({
            url:'./examples/ajax-dialog.html'
        });
    });

});