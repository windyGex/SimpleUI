<div class="description">
	Dialog提供一个类似windows的一个对话框组件，继承自Widget类，拥有和Widget一样的生命周期。Dialog负责聚焦
	页面中的dom以便简化用户操作流程，相对于传统的打开一个新窗口，也更利于Dialog的内容与当前页面进行通信
	作为一个jQuery的插件，为jQuery提供了dialog方法。
</div>
## 开始使用
	
首先加载dialog模块，才能使用相关功能

	require(['ui/dialog'],function(Dialog){
		
		//代码写在这里
		
	});

## demo

<div class="demo">
	<button id="click-me">click me!</button>
	<button id="no-title">没有标题栏的对话框</button>
	<button id="have-button">更换对话框的内容</button>
	<button id="ajax-dialog">加载远程页面</button>
</div>

调用代码：
	
	$('<p>Test</p>').dialog();
	
	
## Dialog的常用方法

* `set`,该方法从Attribute继承而来，用于设置一些属性,目前支持可设置的参数有：
content,title,buttons,handleTool

改变对话框的内容是比较常见的需求，对此可以使用下面的代码：
	
	var dialog = $('<p>Test</p>').dialog();
	dialog.data('widget-dialog')
		  .set('content','<p>the content has be changed!</p>');
	//或者使用下面的代码
	var dialogInc = new Simple.Dialog({
		node:'<p>Test</p>'
	});
	dialogInc.set('content','<p>the content has be changed!</p>');

改变对话框的属性既可以通过在初始化的传入参数，也可以在实例化完成后手动调用set方法来达到同样的目的。

### 隐藏标题
	
	$('#modal').dialog({
		title:false
	});

### 隐藏关闭按钮
	
	$('#modal').dialog({
		handleTool:false
	});

### 定制按钮

按钮的定制是通过`Button`组件来完成的，具体可以查看Button Guides。

	$('#modal').dialog({
		buttons:{
			'sure':function(){

				},
			'cancel':function(){

			}
		}
	});

### 弹出多个窗口

如果需要弹出多个窗口，将stack设置为true，具体可以参见API文档

## 静态方法

### Simple.ajaxDialog

该方法从远程获取内容，并将内容填充到对话框里，该方法返回Dialog的实例,将对于普通的对话框，提供了onLoad事件在请求成功后触发.

	Simple.ajaxDialog({
		url:'test.html',
		onLoad:function(){
			Simple.log('loaded');
		}
	});

### Simple.iframeDialog

该方法生成一个iframe嵌套在对话框里，用于展示数据
	
	Simple.iframeDialog({
		url:'test.html',
		onLoad:function(){
			Simple.log('loaded');
		}
	});

### Simple.alertDialog && sSimple.confirmDialog

该方法提供类似与windows警告框与确认框的功能，不过该方法并不打断代码执行。


## 事件

* `close` 该事件会在dialog销毁的时候触发，返回false可以阻止对话框关闭
* `min` 该事件会在最小化窗口的时候触发，如果没有该工具栏则不会触发该事件
* `max` 该事件会在最大化窗口的时候触发，如果没有该工具栏则不会触发该事件

<div class="notes">
	对于手动调用destroy来销毁对话框不会触发onClose事件，这个时候可以通过Widget的beforeDestroy事件来阻止销毁，隐藏对话框同样不会触发onClose事件
</div>
	
	//使用此代码，该对话框无法通过关闭按钮关闭
	$('#modal').dialog({
		listeners:{
			'close':function(){
				return false;
			}
		}
	});

## 销毁

	$('#modal').dialog('destroy');


<script src="http://simpleui.org/demo/dialog.js">

</script>
	
	
	
	



