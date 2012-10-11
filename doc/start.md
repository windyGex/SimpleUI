
# 快速使用

## 1.引入种子文件

首先引入SimpleUI加载器

	<script src="simpleui/core.js"></script>
	
## 2.使入require方法加载需要资源

	require(['ui/dialog'],function(){
		$('#').dialog();
	});

## 3.使用define编写一个模块，return公开的方法或者属性

	define(function(){
		return 'test';
	});
	
# 使用widget来声明组件

	define('animal',['widget'],function(Widget){
		
		var S = Simple,Animal;
		
		Animal = S.declare('Animal',Widget,{
			template:'<div></div>',
			renderUI:function(){
				this.el.html('animal');
			}
		});
		
		return Animal;
	});
	
	require(['animal'],function(Animal){
		new Animal();
	});




	

	
	
	
	



