<div class="description">
	Menu模块为web应用程序提供了下拉菜单的功能，Menu可以与任何模块轻易的组合以完成需要的功能。Menu模块包含两个类：
	Menu与ContextMenu,其中ContextMenu是Menu的子类，为web应用提供右键菜单的功能。
</div>
## 开始使用

首先需要加载menu模块
	
	require(['ui/menu'],function(Menu){
		
		//代码写在这里
		
	});

## demo

<a class="J-dialog btn" href="/demo/menu.html">run demo</a>

调用代码：
	
	$('#button').menu({
		items:[{label:'i menu',url:'http://simpleui.org'}]
	});

## Menu接受的数据格式

具体参见<a href="http://simpleui.org/api/classes/Simple.Menu.html">API</a>

Menu本身接受三种不同的数据格式以渲染不同的菜单.很抱歉Menu本身并不支持单纯的数组格式的数据，例如下面的格式是不被支持的

	['menu1','menu2','men3']
	
因为对于这种数据渲染出来也没有任何意义，没有事件，没有链接跳转。所以请至少提交下面数据的其中一种.

### 普通菜单

	[{
		label:'menu',
		url:'http://baidu.com'
	}]

### 分组菜单

	[{
		title: 'Menu Title',
		items: [{
		
			label: 'i menu',
			event: function(){},
			checked: true,
		   
		}]
	}]
	
### 多级菜单
	
	[{
		title: 'Menu Title',
		items: [{
		
			label: 'i menu',
			event: function(){},
			checked: true,
		    childs:[{
				label: 'i menu'
			}]
		}]
	}]


## Menu的常用方法

### addChild

针对已存在的菜单添加选项子项，接受的数据格式同上。

### getItem

获取现有的menuItem的实例

	menu.getItem(1).set('checked',true);

## 右键菜单

	$('#button').contextmenu({
		items:[{label:'i menu',url:'http://simpleui.org'}]
	});


<script src="http://simpleui.org/demo/menu.js">
</script>

	
	
	
	



