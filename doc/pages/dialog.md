---
title: Dialog -- SimpleUI
category: Components
name: Dialog
---

`Dialog` simulated native OS window and focus the DOM in page. It provide customized button and skin.
It will not prevent users from operational processes then open a new page.
Of course,it communication with the page more easy.


####  Basic Usage

The following examples show how use `Dialog` components.

<div class="demo">
	<button id="click-me" class="sui-button">click me!</button>
	<button id="no-title"  class="sui-button">no title</button>
	<button id="ajax-dialog"  class="sui-button">load remote page</button>
</div>

``` javascript
	new S.Dialog({
		content:'<p>test</p>'
	});

	new S.Dialog({
		content:'<p>test</p>',
		title: false
	});

	S.Dialog.ajaxDialog({
		url:'./ajax-dialog.html'
	});
```
	
####  Method

##### `set`

Using `set` method to change dialog's property will be reflected the UI.
Currently supports settable properties have `content`,`title`,`buttons`,`handleTool`.
	
``` javascript
var dialog = new S.Dialog({
	content:'<p>Test</p>'
});
dialogInc.set('content','<p>the content has be changed!</p>');
```


#### Static Method

##### `S.ajaxDialog`

This method get content from remote server and fill content in dialog box.It will execute `onload` method after these are done.

```javascript
S.ajaxDialog({
	url:'test.html',
	onload:function(){
		S.log('loaded');
	}
});
```
##### `S.iframeDialog`

This method create iframe and fill it in dialog box.
The only difference is that with ajaxDialog `iframeDialog` support for loading cross-domain pages.

```javascript
S.iframeDialog({
	url:'test.html',
	onload:function(){
		S.log('loaded');
	}
});
```
##### `S.alertDialog` && `S.confirmDialog`


#### Events

* `close`
* `min`
* `max`

<div class="band">
	对于手动调用destroy来销毁对话框不会触发onClose事件，这个时候可以通过Widget的beforeDestroy事件来阻止销毁，隐藏对话框同样不会触发onClose事件
</div>
	
	//使用此代码，该对话框无法通过关闭按钮关闭
	$('#modal').dialog({
		listeners:{
			'close':function(){
				return false;
			}
		}
	});

## 销毁

	$('#modal').dialog('destroy');


<script src="{{assets}}/js/demo/dialog.js"></script>
	
	
	
	



