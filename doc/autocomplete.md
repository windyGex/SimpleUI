<div class="description">
	AutoComplete提供自动完成功能，继承自widget类。AutoComplete是高度可扩展的类，基于此可以编写针对特定情况下的自动完成组件.
	该组件只对input元素有效。
	与任何jQuery插件一样，该组件也为jQuery的nodeList添加了autocomplete方法，以方便调用.
</div>
## 开始使用
	
首先需要加载autocomplete模块

	require(['ui/auto-complete'],function(AutoComplete){
		
		//代码写在这里
		
	});

## 基本的自动完成功能

<div class="demo">
	<input type="text" id="demo1" class="input-text"/>
</div>

调用代码：
	
	$('#demo1').autocomplete({
		source:['java','javascript','source','jdk','asp','php','ruby']
	});
	
## autocomplete接受的数据说明

通常autocomplete获取的数据是直接从服务器上获取的，那么autocomplete本身接受什么样的数据呢，如果不想复写任何方法就可以使其完成功能，那么你需要遵循下面的数据格式
	
	[
		{label:'java',value:'java'},
		{label:'javascript',value:'javascript'}
	]

其中label用于显示，而value则用于赋值到input上，这个时候调用代码可能像下面的格式

	$('#demo1').autocomplete({
		source: '/get_soucre.do' //获取数据的服务器地址
	});
	
## 扩展autocomplete

很多情况下，可能需要使用的数据在第三方的服务器上，比如现在提供的各种可样的Open API，如果想要通过这些第三方的平台完成自动提示功能，那么程序原本的功能肯定无法满足服务器提供的数据
所以autocomplete提供了几个可以复写的方法以便适配第三方的数据。

* `source`，在这种情况下，source通常是一个方法，这个方法负责从服务器上获取数据，并解析返回的数据
* `getData`,getData负责帮你拿到真实的需要解析的数据
* `getDataLength`，getDataLength则负责帮你拿到真实的解析数据的长度，因为有的情况下可能并不能通过数据直接得到其length
* `formatGroup`,通过该方法可以完全重写自动提示的样式，该方法接受的值为得到的真正需要解析的数据
* `formatItem`，通过该方法则可以针对遍历后的单条数据进行样式定制

### 从淘宝上获取自动提示数据

<div class="demo">
	<input type="text" id="taobao" class="input-text"/>
</div>

调用代码：

	$('#taobao').autocomplete({
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
		formatItem : function (value, item ,index) {
			var itemText = item[0].replace(value, "<b class='orange'>" + value + "</b>"),
				li = $("<div class='simple-autocomplete-item'/>").html(itemText)
				.attr("rel", 'autocompleteItem')
				.attr('data-value',item[0]);
				
			return li;
		},
		listeners:{
				
				'select':function(val){
					Simple.log(val);
				}
			
		}
	});

### 从soso音乐上获取自动提示数据

<div class="demo">
	<input type="text" id="soso" class="input-text"/>
</div>

调用代码：

	$('#soso').autocomplete({
			style:{
				width:180
			},
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
				Simple.each(data,function(value,key){
				
					length += value.length;
				});
				return length;
			},
			formatGroup:function(val,currentData){
				
				var html = '';
				Simple.each(currentData,function(items,key){

					if(items.length){
						switch(key){
					
						case 'song':
						html += "<h3>歌曲：</h3>";
						break;
						case 'singer':
						html += "<h3>歌手：</h3>";
						break;
						case 'album':
						html += "<h3>专辑：</h3>";
						break;
						case 'mv':
						html += "<h3>mv：</h3>";
						break;
					}
						Simple.each(items.splice(0,3),function(item,index){
							html += '<div rel="autocompleteItem" data-value="'
									+item.name+'" class="simple-autocomplete-item">'
									+item.name+'</div>';
						});
					}

					
				});
				
				return html;
			},
			listeners:{
				
				'select':function(val){
					Simple.log(val);
				}
			
			}	
		});
		
## 事件
具体使用方法参见上方的demo

* `change` 该事件会在使用键盘切换自动提示项的时候触发
* `select` 该事件会在选中某个自动提示项的时候触发

## 销毁

	$('#soso').autocomplete('destroy');


<script src="http://simpleui.org/demo/autocomplete.js">

</script>
	
	
	
	



