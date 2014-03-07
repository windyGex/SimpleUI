---
title: Button -- SimpleUI
category: Components
name: Button
---

Button is an element like HTML Button Element but provide more function.

#### Markup

<div class="demo" id="demo">
	<div class="sui-button sui-button-normal" role="button">Block Element</div>
	<a class="sui-button sui-button-normal" role="button">Anchor</a>
	<button class="sui-button sui-button-normal">Normal Button</button>
</div>

```html
<div class="sui-button sui-button-normal" role="button">Block Element</div>
<a class="sui-button sui-button-normal" role="button">Anchor</a>
<button class="sui-button sui-button-normal">Normal Button</button>
```

	
#### Method

##### `set`

Using `set` method to change dialog's property will be reflected the UI.
Currently supports settable properties have `label`,`icon`,`disabled`.


```javascript
var button = new S.Button({
	label:'test',
	disabled:true,
	handle:function(){
		console.log('click event');
	}
}).render(document.body);
button.set('disabled',false);
```

#### Examples

##### Render  buttons

<div class="demo" id="button-wrap">
	<p id="disable-primary"><a href="javascript:;">Click me to disable primary Button</a></p>
</div>
```javascript
var primaryButton = new S.Button({
	label:'Primary button',
	className:'sui-button-primary',
	handle:function(){
		console.log('click event');
	}
}).render('#button-wrap');

var warnButton = new S.Button({
        label:'Warn button',
        className:'sui-button-warn',
        handle:function(){
            console.log('click event');
        }
}).render('#button-wrap');

$('#disable-primary').click(function(){
    primaryButton.set('disabled',true);
});
```

<script src="{{assets}}/js/demo/button.js"></script>

	
	
	
	



