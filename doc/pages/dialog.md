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
	<button id="click-me" class="sui-button sui-button-normal">click me!</button>
	<button id="no-title"  class="sui-button sui-button-normal">no title</button>
	<button id="ajax-dialog"  class="sui-button sui-button-normal">load remote page</button>
</div>

``` javascript
	new S.Dialog({
		content:'<p>test</p>'
	});

	new S.Dialog({
		content:'<p>test</p>',
		title: false
	});

	S.Dialog.Ajax({
		url:'./ajax-dialog.html'
	});
```
	
####  Method

##### `set`

Using `set` method to change dialog's property will be reflected the UI.
Currently supports settable properties have `content`,`title`,`buttons`,`handleTool`.

<div class="demo" id="dialog-test">
	<button id="change-content" class="sui-button sui-button-normal">click me!</button>
</div>
	
``` javascript
var dialog = new S.Dialog({
	content:'<p>Test</p>',
	buttons:[{
		'label':'Change content',
		'handle':function(){
			dialog.set('content','<p>the content has be changed!</p>');
		}
	}]
}).render('#dialog-test');
```


#### Static Method

##### `S.Dialog.Ajax`

This method get content from remote server and fill content in dialog box.
It will execute `onload` method after these are done.

```javascript
S.Dialog.Ajax({
	url:'test.html',
	onload:function(){
		console.log('loaded');
	}
});
```
##### `S.Dialog.Iframe`

This method create iframe and fill it in dialog box.
The only difference is that with ajaxDialog `iframeDialog` support for loading cross-domain pages.

<div class="demo" id="dialog-test">
	<button id="iframe-content" class="sui-button sui-button-normal">click me open baidu.com!</button>
</div>

```javascript
var dialog =  S.Dialog.Iframe({
    width:700,
    height:500,
    url:'http://baidu.com',
    buttons:[{
        'label':'Close',
        'className':'sui-button-primary',
        'handle':function(){
            dialog.destroy();
        }
    }]
});
```
##### `S.Dialog.Alert` && `S.Dialog.Confirm`

This method simulated native browser alert window and confirm window,but it not prevent javascript execution process.

<div class="demo" id="dialog-test">
	<button id="alert-content" class="sui-button sui-button-normal">Alert Content</button>
	<button id="confirm-content" class="sui-button sui-button-normal">Confirm Content</button>
</div>

```javascript
S.Dialog.Alert({
	content:'System error',
	onsure: function(){
		console.log('sure');
	}
});
S.Dialog.Confirm({
	content:'Do you delete this messages?',
	onsure: function(){
		console.log('sure');
	}
});
```
#### Events

* `close` trigger when dialog box close.
* `show` trigger when dialog box show.
* `hide` trigger when dialog box hide.

<div class="bs-callout bs-callout-info">
<p>
	If you invoke `destroy` method manual,dialog won't trigger `close` event. Of course, you can also use `return false`
	to prevent the dialog box close.
</p>
</div>

<div class="demo" id="dialog-test">
	<button id="close-content" class="sui-button sui-button-normal">This dialog won't close.</button>
</div>

``` javascript
var dialog = new S.Dialog({
    content:'test',
    buttons:[{
        label:'Please click here to close',
        handle:function(){
            dialog.destroy();
        }
    }]
});

dialog.on('close',function(){
  return false;
});
```

<script src="{{assets}}/js/demo/dialog.js"></script>
	
	
	
	



