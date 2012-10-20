<div class="description">
	SimpleUI提供一个符合<a href="https://github.com/cujojs/curl#what-is-amd" target="_blank">AMD</a>规范的加载器用于JS与CSS等资源的异步加载。如果你对SeaJS或者RequireJs亦或者CurlJS比较熟悉的话，那么SimpleUI的加载器也是比较容易上手的。
	SimpleUI的加载器其实是RequireJS的精简版，去除了NodeJs等环境下的冗余代码，代码仅有两百多行，但是却实现了AMD的全部规范。
</div>
## 定义一个模块

语法如下：其中模块名与依赖都是可选的。

	define([moduleName],[deps],factory)
	
### 定义一个对象

	define({
		a:1,
		b:2
	});
### 定义一个具名模块

在具名模块中，模块本身相对与配置的跟路径为资源加载标识，而模块名则为资源使用标识。一般情况下请保持模块名与模块的相对路径相同。

	define('test',function(){
		return 'abc';
	});
	
### 定义一个匿名模块
	
在匿名模块中，模块本身相对与配置的根路径为模块名。

	define(['jquery'],function(){
		return 'abc';
	});
	
## 使用一个模块

语法如下：

	require([deps],factory);
	
	
初始情况下,`require`会从当前已加载的模块中寻找需要的资源，如果没有则通过模块名相对于配置的根路径加载相应的资源，等所有的资源准备就绪后，开始执行`factory`.
多个require函数会放入一个队列，依次执行。

	require(['test'],function(test){
		console.log(test);//'abc'
	});

### 配置

* `baseUrl`,该配置为所有资源加载的根路径
* `paths`,该配置为加载资源的时候的路径简写

		require.config({
			baseUrl:'http://style.simpleui.com/',
			paths:{
				app:'./app/src'
			}
		});
		// a 的路径是http://style.alibaba.com/a.js
		// b 的路径是http://style.alibaba.com/app/src/b.js
		require(['a','app/b'],function(){

		});

## 插件

为了使加载器可以加载不同的资源而定制。插件其实是一个模块。使用define定义，最简单的插件模块应该包含一个load方法以便告诉加载器资源是否已经被加载。

	define({
		load:function(name,require,load,config){
			
		}
	});

### CSS插件：

	//加载dialog.css
	define(['css!dialog'],function(){
	
	});

### Text插件：
	//加载dialog.html
	define(['text!dialog'],function(){
	
	});
	
## 其他

### JSONP

require同样可以作为JSONP的加载器，如果你明白JSONP的加载原理就很容易知道JSONP其实是通过script标签请求了一段脚本并执行，如果JSONP支持callback的定义，那么完全可以有如下的形式：

	require(['http://simpleui.org/?callback=define'],function(data){
		console.log(data);
	});
	
### <a href="http://simpleui.org/deploy">部署</a>请看这里.

在require的世界里，所有的东西都是模块，从现在开始享受模块化编程吧。



	

	



