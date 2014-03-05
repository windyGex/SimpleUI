<div class="description">
	Button类提供了类似桌面按钮的功能，虽然原生HTML元素包含button，但是对于一些富应用，button还是需要定制的。
	Button模块包含三个类：Button,DropDownButton,ComboButton。其中DropButton与ComboButton继承自Button
</div>

Button provide element like HTML Button Element.

## 开始使用
	
	require(['ui/button'],function(Button){
		
		//代码写在这里
		
	});

## demo--一个普通的按钮

<div class="demo" id="demo">
	
</div>

调用代码：
	
	new Button({
		container:'#demo'
	});
	
## demo--一个下拉按钮

<div class="demo" id="demo2">
	
</div>

调用代码：
	
	var menu = new Simple.Menu({
		items:[{label:'simple-menu'}]
	})
	new Simple.DropDownButton({
		container:'#demo',
		dropdown:menu
	});
	
## Button的常用方法

* `set`,该方法从Attribute继承而来，用于设置一些属性,目前支持可设置的参数有：
** label,icon,disabled

改变Button的属性既可以通过在初始化的传入参数，也可以在实例化完成后手动调用set方法来达到同样的目的。

### 禁用按钮
	
	var button = new Button({
		disabled:true
	})
	//或者是下面的代码
	var button = new Button();
	button.set('disabled',true);
	
### 启用按钮

	button.set('disabled',false);

## 销毁

	button.destroy();

<script src="http://simpleui.org/demo/button.js">

</script>

	
	
	
	



