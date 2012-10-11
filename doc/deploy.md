<div class="description">
	SimpleUI的模块加载器遵循<a href="http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition" target="_blank">AMD规范</a>，
	所以对于SimpleUI编写的代码而言，任何遵循AMD规范的打包工具都适用于SimpleUI。
	本篇文章介绍的是基于<a href="https://github.com/jrburke/r.js" target="_blank">r.js</a>的打包工具。
</div>
## 开始使用
	
r.js 需要Node环境或者Java环境，推荐使用Node环境。如果你不知道怎么安装Node，<a href="http://nodejs.org/" target="_blank">参考这里</a>

	npm install -g requirejs

下载r.js放置到工程的根目录，使用配置文件或者启动文件来进行build

	node r.js -o build.js
	
这种方式适合加载所需要的模块，更灵活。
	
或者

	node r.js -o name=init out=init.min.js baseUrl=./
	
如果你想合并所有的依赖进入单个文件，这种方式是最佳选择。但是不适合定制

## build文件常用配置选项

* `appDir` 配置程序目录
* `baseUrl` 配置加载JS的根路径
* `dir` 配置build输出的路径
* `package` 配置包
* `module` 配置build的模块
* `name` 配置build单个文件的JS
* `out` 配置build单个文件后的JS

例子如下：

	({
		appDir : "./simpleui",
		baseUrl : "./",
		dir : "./build",
		
		
		modules : [{
				name : "simple"
			}, {
				name : "declare"
			}
		]
	})
	
## main.js 

通常这是一个应用程序的启动文件

	node r.js -o name=main out=main.min.js baseUrl=./

main的代码如下：

	require(['main'],function(Main){
		Main.init();
	});
	

	
	
	
	



