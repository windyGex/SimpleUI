<div class="description">
	Drag模块为web应用增加类似桌面应用程序般的功能和易用性。Drag本身可以让一个Dom元素可移动， 
	并且可以设置拖动手柄来启用拖动，也可以设置拖动的范围。Drag模块本身包括了一个放置模块，通过抛出的事件使得交互变得更加简单
</div>
## 开始使用
	
	require(['ui/drag'],function(Drag){
		
		//代码写在这里
		
	});

## demo

<div class="demo" id="demo">
	<div class="drag-demo" style="border:1px solid #979797;padding:20px 50px;width:200px;background:#fff;">
		drag me!
	</div>
</div>

调用代码：
	
	$('.drag-demo').drag();

## Drag的常用设置属性

具体参见<a href="http://simpleui.org/api/classes/Simple.Drag.html">API</a>

### proxy
设置一个拖动代理。
	
	$('.simple-dialog').drag({
		proxy:'clone'
	});
### container
限制拖动的范围
	
	$('.simple-dialog').drag({
		container:document.body
	});
	
### dropElements

<a class="btn J-dialog" href="/demo/drag.html" type="iframe">run demo</a>

指定触发放置事件的元素，接收dom对象与jQuery选择器.

* 如果有多个放置对象存在时，在drop的事件监听中请使用当前放置的区域对象来获取，而不要使用全局的dropElements
	
		$('#demo').drag({
			dropElements:'.test',//this element's length > 1
			listeners:{
				drop:function(dropElements){
					// not this.dropElements
					//dropElements.el do sth
				}
			}
		});
	
* 如果拖动对象的面积远大于放置区域的面积，导致同时与多块放置区域相交，则以最后一次相交的区域作为放置区域

		$('.list').drag({
			//指定拖动手柄
			handle: 'h2',
			//拖动代理
			proxy: 'clone',
			//返回原处
			revert: true,
			//放置区域
			dropElements: '.drop-area',
			listeners: {
				//拖动过程中
				drag: function(){
					this.dropElements.addClass('active');
				},
				//拖动进入
				dragEnter: function(){
					this.dropElements.addClass('focus');
				},
				//拖动离开
				dragLeave: function(){
					this.dropElements.removeClass('focus');
				},
				//拖动停止
				dragStop: function(){
					this.dropElements.removeClass('active');
				},
				//放置
				drop: function(){
					this.dropElements.find('ul').append(this.node);
					this.node.hide().fadeIn().animate({
						width: '80px',
						height: '80px'
					});
					this.dropElements.removeClass('focus');
				}
			}
		});



## 事件
Drag模块为交互提供了完备的事件支持，是拖放的交互代码编写变得更容易。
*  `drag`，拖动的时候触发的事件
*  `dragStart`，拖动开始的时候触发的事件，如果返回false，则阻止拖动
*  `dragEnter`，拖动进入放置元素时触发的事件
*  `dragLeave`，拖动离开放置元素时触发的事件
*  `dragStop`，拖动停止的时候触发的事件
*  `drop`，拖动放置元素时触发的事件

<script src="http://simpleui.org/demo/drag.js">
</script>

	
	
	
	



