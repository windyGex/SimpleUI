<div class="description">
	tool-tip模块包含两个类：ToolTipBase与ToolTip,其中ToolTip共享一个ToolTipBase实例。ToolTipBase继承于Dialog。
	ToolTip提供类似windows的title功能，但是能定制各种各样的tip类型以满足不同的需求
</div>
## 开始使用
	
首先加载tool-tip模块

	require(['ui/tool-tip'],function(){
		
		//代码写在这里
		
	});
	
默认情况下，如果没有指定content,则代码会自动从元素的data-title属性上寻找content,content可以接受字符串与函数两种数据，如下面的示例。

## demo

<div class="demo">
	不适合针对页面中<a data-title="具体操作点">具体操作点</a>的反馈的情况。（例如：<a data-title="首页">首页</a>中内嵌登录区的画面，登录错误的反馈）
	表单类画面中，有多个错误点，需要在顶部汇总所有<a data-title="错误信息">错误信息</a>的情况。（主要是优化由于表单反馈过多而采用的样式，可根据具体场景进行选择）
</div>

调用代码：
	
	$('.demo a').tooltip();
	
	
## ToolTip的常用方法

* `set`,该方法从Attribute继承而来，用于设置一些属性,目前支持可设置的参数有：content

<a class="btn J-dialog" href="/demo/tooltip.html">run demo</a>
	
	$('a').each(function(){
		var href = this.href;
		var t = $(this).tooltip({
			allowTipHover:true,
			content:function(){
				$.get(href,function(r){
					t.data('widget-tooltip').set('content',r);
				});
				return 'loading...';
			}
		});
				
	});
## 销毁

	$('.demo a').tooltip('destroy');


<script src="http://simpleui.org/demo/tooltip.js">

</script>
	
	
	
	



