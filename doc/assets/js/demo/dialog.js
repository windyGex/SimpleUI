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
        S.Dialog.Ajax({
            url:'./examples/ajax-dialog.html'
        });
    });


    $('#change-content').click(function(){
        var dialog = new S.Dialog({
            content:'<p>Test</p>',
            buttons:[{
                'label':'Change content',
                'className':'sui-button-primary',
                'handle':function(){
                    dialog.set('content','<p>the content has be changed!</p>');
                }
            }]
        });
    });

    $('#iframe-content').click(function(){
        var dialog =  S.Dialog.Iframe({
            width:700,
            height:500,
            url:'http://baidu.com',
            buttons:[{
                'label':'Close',
                'className':'sui-button-primary',
                'handle':function(){
                    dialog.destroy();
                }
            }]
        });
    });

    $('#alert-content').click(function(){
        var dialog = S.Dialog.Alert({
            content:'System error',
            onsure: function(){
                console.log('sure');
            }
        });
    });

    $('#confirm-content').click(function(){
        var dialog = S.Dialog.Confirm({
            content:'Do you delete this messages?',
            onsure: function(){
                console.log('sure');
            }
        });
    });

    $('#close-content').click(function(){
        var dialog = new S.Dialog({
            content:'test',
            buttons:[{
                label:'Please click here to close',
                handle:function(){
                    dialog.destroy();
                }
            }]
        });

        dialog.on('close',function(){
          return false;
        });
    });


});