<div class="description">
	Resizable模块提供对dom节点的尺寸重设大小功能，不过这个模块现在用的越来越少了。
	为jQuery添加`resizable`方法，为了与resize事件进行区分
</div>
## 开始使用
	
	require(['ui/resizable'],function(Resizable){
		
		//代码写在这里
		
	});

## demo

<div class="demo" id="demo">
	<div class="resize-demo" style="border:1px solid #979797;padding:20px 50px;width:200px;background:#fff;">
		
	</div>
</div>

调用代码：
	
	$('.resize-demo').resizable({
		direction:['s']
	});

## Resizble的常用设置属性

具体参见<a href="http://simpleui.org/api/classes/Simple.Resize.html">API</a>

### direction
设定resize的方向,可选值
	
	"n", "ne", "e", "se", "s", "sw", "w", "nw"


<script src="http://simpleui.org/demo/resizable.js">
</script>

	
	
	
	



