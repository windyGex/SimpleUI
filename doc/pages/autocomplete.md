---
title: AutoComplete -- SimpleUI
category: Components
name: AutoComplete
---


When you type into field, AutoComplete will suggest appropriate value for you.
You can pass an javascript Array or an instance of Store to AutoComplete then control the suggestions.
AutoComplete is also built to be modular and easy to extend so that it can be used as the basis for custom implementations and widgets.

#### Basic Usage

<div class="demo">
	<input type="text" id="demo1" class="input-text"/>
</div>


``` javascript
new S.AutoComplete({
	node:'#demo1',
	source:['java','javascript']
});
```
	
#### Accept Data

Usually,you can get data from server.In order for AutoComplete to work properly, you need to provide the following data.
Using label property to display in page and value property that assigned to input element.

``` javascript
[{"label":"java","value":"java"},{"label":"javascript","value":"javascript"}]

new S.AutoComplete({
        node:'#demo1',
        source:'/get-source.htm'
});
```
You can also pass an instance of <a href="{{relative absolute 'dest/docs/jsonstore.html'}}">DataStore</a> to AutoComplete's `source` property.

``` javascript
var store = new S.JsonStore({
	data:[{"label":"java","value":"java"},{"label":"javascript","value":"javascript"}]
});

new S.AutoComplete({
    node:'#demo1',
    source: store
});
```
#### Events

AutoComplete will fire a custom event named `select` when you select a value.

``` javascript
var autoComplete = new S.AutoComplete({
        node:'#demo1',
        source: store
});

autoComplete.on('select',function(value){
	console.log(value);
});
```


#### Examples

* Get suggestions from taobao.com Open API.

<div class="demo">
	<input type="text" id="taobao" class="input-text"/>
</div>

Well, you know this is a JSONP interface, so you must custom `source` property to get data. `source` can accept a function.

``` javascript
var getDataFromTaobao = function(val,parse){
$.ajax({
	url : "http://suggest.taobao.com/sug?code=utf-8&callback=?",
	data : {q : val},
    dataType : "jsonp",
    success : function (result) {
        parse(result);
    }
});
}

new S.AutoComplete({
    node:'#taobao',
    source : getDataFromTaobao,

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
```
* Get suggestions from qq.com and custom display content.

<div class="demo">
	<input type="text" id="soso" class="input-text"/>
</div>

``` javascript
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
```
<script src="{{assets}}/js/demo/autocomplete.js"></script>
	
	
	
	



