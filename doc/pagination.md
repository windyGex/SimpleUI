<div class="description">
	Pagination为web页面提供分页功能，传统的页面分页一般都是后端生成的，但是对于无刷新的数据交互而言，分页往往是在前端生成的。
	对于任何大批量的数据或者延迟加载的数据，分页展示都是比较常见的行为。
</div>
<div class="notes">
	Pagination没有提供相对应的jQuery方法，原因是因为对于Pagination而言没有明确的node节点,仅仅存在容器。
</div>
## 开始使用

首先需要加载pagination模块
	
	require(['ui/pagination'],function(Pagination){
		
		//代码写在这里
		
	});

## demo

<div class="demo" id="demo">
	
</div>

	new Pagination({
		container:'#demo'
	});

## 分页定制

在分页组件里指定pageStyle可以定制分页的样式。如果需要不同的分页样式针对Pagination.style添加不同的方法即可。
	
	Pagination.style.simple = function(currentPage,totalPage){
		
		//组装HTML。。。
		
		return pageHtml;
	}


## 方法

* `set` 设置当前页或者总页数或者分页尺寸,`currentPage`,`pageSize`,`totalCount`.

		var pagination = new Pagination({
			container:'#demo',
			listeners:{
				currentPageChange:function(){
					console.log(this.currentPage);
				}
			}
		});

		pagination.set('currentPage',2);
		pagination.set('pageSize',10);
	
## 事件

* `beforeCurrentPageChange`，通过该事件来阻止当前页的改变
* `currentPageChange`，通过该事件监听当前页的改变

<script src="http://simpleui.org/demo/pagination.js">
</script>

	
	
	
	



