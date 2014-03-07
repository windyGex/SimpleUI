require(['sui'],function(S){

    var primaryButton = new S.Button({
        label:'Primary button',
        className:'sui-button-primary',
        handle:function(){
            console.log('click event');
        }
    }).render('#button-wrap');

    var warnButton = new S.Button({
        label:'Warn button',
        className:'sui-button-warn',
        handle:function(){
            console.log('click event');
        }
    }).render('#button-wrap');

    $('#disable-primary').click(function(){
        primaryButton.set('disabled',true);
    });
});