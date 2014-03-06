require(['sui'],function(S){
    new S.AutoComplete({
        node:'#demo1',
        source:['java','javascript']
    });

    new S.AutoComplete({
        node:'#taobao',
        source :function (val, parse) {
            $.ajax({
                url : "http://suggest.taobao.com/sug?code=utf-8&callback=?",
                data : {
                    q : val
                },
                dataType : "jsonp",
                success : function (r) {
                    parse(r);
                }
            });
        },
        getData:function(data){
            return data.result;

        },
        getValue:function(item){
            return item[0];
        },
        formatItem : function (value, item ,index) {
            var itemText = item[0].replace(value, "<b class='orange'>" + value + "</b>"),
                li = $("<div class='sui-autocomplete-item'/>").html(itemText)
                    .attr("rel", 'autocompleteItem')
                    .data('item',item);

            return li;
        }
    });

    new S.AutoComplete({
        node:'#soso',
        source:function(val,parse){
            $.ajax({
                url:"http://s.plcloud.music.qq.com/fcgi-bin/smartbox.fcg?utf8=1&g_tk=5381",
                data:{
                    key:val
                },
                dataType:'jsonp',
                jsonpCallback:'MusicJsonCallBack',
                success:function(r){
                    parse(r);
                }
            })
        },
        getData:function(data){
            return data.tips;
        },
        getDataLength:function(data){
            var length =0;
            $.each(data,function(key,value){
                length += value.length;
            });
            return length;
        },
        getValue: function(item,el){
            return el.attr('data-value');
        },
        formatGroup:function(val,currentData){

            var html = '';
            $.each(currentData,function(key,items){

                if(items.length){
                    switch(key){

                        case 'song':
                            html += "<h3 class='demo-autocomplete-title'>Song：</h3>";
                            break;
                        case 'singer':
                            html += "<h3 class='demo-autocomplete-title'>Singer：</h3>";
                            break;
                        case 'album':
                            html += "<h3 class='demo-autocomplete-title'>Album：</h3>";
                            break;
                        case 'mv':
                            html += "<h3 class='demo-autocomplete-title'>MV：</h3>";
                            break;
                    }
                    $.each(items.splice(0,3),function(index,item){
                        var  itemText = item.name.replace(val, "<b class='orange'>" + val + "</b>");
                        html += '<div rel="autocompleteItem" data-value="'+item.name+'" class="sui-autocomplete-item">'+itemText+'</div>'
                    });
                }
            });
            return html;
        }
    });
});