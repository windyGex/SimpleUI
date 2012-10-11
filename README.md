SimpleUI
========

SimpleUI是基于jQuery的组件库，包含了常见的web组件，适用于开发web2.0的应用程序与小型网站。SimpleUI继承了jQuery的简单，但是却避免了代码的高度耦合。继承自Widget的完善的组件生命周期，面向HTML扩展的组件开发，针对HTML5与CSS3的技术升级，或许SimpleUI是你最佳的选择。


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




	

	
	
	
	



