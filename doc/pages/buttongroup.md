<div class="description">
	ButtonGroup是Button的集合，根据提供的数据，渲染多个Button。这在需要很多按钮时非常有用，并且可以根据索引来选择聚焦或者禁用亦或者启用某个按钮。
	
</div>
## 开始使用
	
	require(['ui/button-group'],function(ButtonGroup){
		
		//代码写在这里
		
	});

## demo

<div class="demo" id="demo-btn-group">
	
</div>

调用代码：
	
	new Button({
		items : {
			'index1' : function () {
				console.log('index1');
			},
			'index2' : function () {
				console.log('index2');
			}
		},
		container : '#demo-btn-group'
	});

## ButtonGroup的常用方法



改变Button的属性既可以通过在初始化的传入参数，也可以在实例化完成后手动调用set方法来达到同样的目的。

### 禁用按钮
	
	button.disable(1);
	
### 启用按钮

	button.enable(1);

## 销毁

	button.destroy();

<script src="http://simpleui.org/demo/button.js">

</script>

	
	
	
	



