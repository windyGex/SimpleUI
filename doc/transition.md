<div class="description">
	为SimpleUI的组件提供缓动效果，此效果使用CSS3的transition属性实现，目前包含slide,drop,fade,sacle等四种效果。
	 在低级浏览器下只有机械式的显示隐藏
</div>
## 开始使用
	
首先需要加载transition模块

	require(['transition'],function(Transition){
		
		//代码写在这里
		
	});

## demo

<div class="demo" style="height:170px;">
	<button id="slide">slide</button><button id="fade">fade</button><button id="drop">drop</button><button id="scale">scale</button>
	<div id="transition" style="border:1px solid #ccc;padding:10px;width:100px;height:100px;margin-top:10px;display:none;background:#eee;">
		我是会变化的类
	</div>
</div>

调用代码：
	
	var t = new Transition({
	                node: '#transition'
	}),
	buttons = ['slide', 'fade', 'drop', 'scale'];
	Simple.each(buttons, function(id){
	
	    $('#' + id).toggle(function(){
	        t.set('type', id);
	        t.show();
	    }, function(){
	        t.hide();
	    })
	});

## 事件
具体使用方法参见上方的demo

* `show` 该事件会在节点显示后触发
* `hide` 该事件会在节点隐藏后触发

## 销毁

	$('#demo').transition('destroy');


<script src="http://simpleui.org/demo/transition.js">

</script>
	
	
	
	



