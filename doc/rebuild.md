<div class="description">
	相对于JS而言，CSS的性能并不是那么的被重视，因为很少有性能问题会出现在CSS上(除了IE的滤镜外)。但是一旦介入的开发人员变多，几经折腾后，对于庞大的站点来说CSS将会变得越加冗余，难以维护。
	feedback与mail在之前的两个月的时间里做了一次重构，虽然性能提升仅有400ms，但是对于可维护性上还是有很大提升的，在此分享下重构时的心得以及遇见的问题。

</div>
## 回首过去
不可否认，在中国使用IE6，7以及各种浏览器下IE6，7内核的浏览器或者高级浏览器下运行兼容模式的大有人在。在重构的过程中，我们也遇见不少这种问题。
作为一名合格的前端工程师，当然要解决这些常见的问题，保持界面展现的一致性。

### 双边距的bug(IE6)

现象：块状元素在设置浮动的时候设置外边距与浮动的*方向一致*的时候会导致外边距加倍

解决方案：

* 设置浮动的块状元素为内联。
	div{
		float:left;
		display:inline;
	}

* 使用hack的方式设置IE6下边距为原先的一半
	div{
		float:left;
		margin-left:10px;
		_margin-left:5px;
	}

### 定位产生的bug(IE6,IE7)

* 父级设置overflow:auto时，如果子级有定位元素，则父级滚动的时候在IE6，7下该定位元素保持不动。

	解决方案：为父级设置定位。

		<div class="parent">
			<div class="child"></div>
		</div>

		.child{
			height:1000px;
			position:relative;
		}
		.parent{
			height:500px;
			overflow:auto;
			position:relative;/*hack for IE6,7*/
		}

* 元素的z-index的实际大小取决于有定位的父级的z-index大小。

		<div class="parent parent1">
			<div class="child"></div>
		</div>
		<div class="parent">
			<div class="child2"></div>
		</div>

		.parent{
			position:relative;
		}
		.child{
			z-index:10;
			position:relative;
		}
		.child2{
			z-index:5;
			position:relative;
		}
		/*hack IE6,7*/
		.parent1{
			z-index:2;
		}

* 绝对定位情况下，如果直系子级元素是块状元素，且父级没有设置定宽，会将父级充满整个屏幕。
	
		<div class="dialog">
			<div class="dialog-content"></div>
		</div>

	解决方案：为直系子级设置display:inline或者为父级设置定宽。
		
		.dialog-content{
			display:inline;
		}
### 没有定宽造成的bug
现象：IE6，7下块状元素其内部的行内元素display:block无法充满整个块状元素。
解决方案：为父级设置定宽。

## 最佳实践
实践总会证明问题的正确性。或许下面的不能称之为最佳实践，但是却是实实在在的存在着。

### 避免重复
两种情况会出现重复定义：

* 属性冲突的，或者二者里面只会有一个生效。这个时候只需要保留你需要的一个即可。

		span{
			float:left;
			display:inline-block;
		}
		====>
		span{
			float:left;
		}

		a{
			text-indent:10px;/*该代码在默认情况下不会生效,因为text-indent只对于块状元素有效*/
		}

		对于内联元素而言，设置display:inline-block在IE7—下并不需要hack代码。

		
		span{
			display:inline-block;
			*display:inline;
			zoom:1;
		}
		====>
		span{
			display:inline;
		}

* 可以继承自父级的，比如font，color 等

	对于表单元素而言，必须强制设定font-family:inherit才会有效果，否则不会继承父级的字体设定

		div{
			color:#333;
		}
		div span{
			color:#333;
		}
		====>
		div{
			color:#333;
		}

### 抽象结构
很多事物都有统一的基础，HTML结构也是，良好的HTML结构可以让CSS有更好的发挥余地。最常见的图文混排两列布局：
	
	<div class="media">
		<div class="sub">
			<img src=""/>
		</div>
		<div class="main">
		</div>
	</div>

	--->
	.media .sub{float:left;}
	.media .main{overflow:hidden;}

将所有的图文混排两列布局用于此结构与代码。对于边距等相关设置使用子级元素来实现。

### 多态复写
一个模块有多个状态，对于模块本身，使用模块的多态复写该模块。

	<div class="tip tip-alert">
	</div>

	.tip{

	},
	.tip-alert{

	}

	<a class="btn btn-disabled"></a>
但是脱离了该模块本身，而被应用于另外一种环境中，如果该模块状态发生了变化，且该状态不再该模块的控制范围内，则使用环境本身来复写该模块。

	<div class="dialog">
		<div class="tip tip-alert">
		</div>
	</div>

	.dialog .tip-alert{

	}
## 面向未来
任何事物都不会停滞不前，CSS也是一样，重构的过程中，有意识加入针对高级浏览器的特性加入的代码或许会让升级浏览器的用户感到惊喜,可喜的是allin现在已经在使用这些高级浏览器支持的特性。

* 定义元素的状态伪类

		:focus{}
		:active{}
		:hover{}

* 使用after与before伪类减少dom结构

		input[type="checkbox"]:checked::after{
			content:url('')
		}

* 为某些元素加入缓动效果

		.menu{
			 -moz-transition: opacity 0.2s ease-out 0s, -moz-transform 0.15s ease-out 0s;
		}
* 使用渐变替代图片的重复平铺

		.toolbar{
			background-image: -moz-linear-gradient(top, #f8f8f8, #f2f2f2);
		}
* 使用base64减少图片的加载数量

		.checkbox{
			background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOBAMAAADtZjDiAAAAA3NCSVQICAjb4U/gAAAALVBMVEX////7+/v39/fz8/Pv7+/q6uri4uLS0tLKysq9vb25ubm1tbWxsbGtra3///9sVLQXAAAAD3RSTlP//////////////////wDU3JihAAAACXBIWXMAAArDAAAKwwE0KSSrAAAAFnRFWHRDcmVhdGlvbiBUaW1lADA1LzEyLzEyLJl5kQAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAABFSURBVAiZY7BYBQLNDG0MIJDBsBBMSzEsFAQBKYaNYFoaTm9SAgFthsPGIGADp4+4gIAPnL4aCgKxDNPBdCWD510QmAIAgy4eFg8aI0gAAAAASUVORK5CYII=");
		}

* 针对webkit定制滚动条

		::-webkit-scrollbar-track-piece {
		    background-color: #fff;
		    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.2) inset;
		} 
		::-webkit-scrollbar {
		    width: 13px;
		    height: 10px;
		    cursor: pointer;
		} 
		::-webkit-scrollbar-thumb {
		    height: 50px;
		    background-color: #ccc;
		   
		} 
		::-webkit-scrollbar-thumb:hover {
		    height: 50px;
		    background-color: #9f9f9f;
		    
		}
	
或许重构在外人看来界面其实没有什么变化，但是其中涉及的种种只有从事同种职业的人才能体会吧。任重而道远。

	
	
	
	



