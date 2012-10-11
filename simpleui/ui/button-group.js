/*This is beta version*/
define(['simple', 'declare', 'widget', 'ui/button'], function(S, declare, Widget,Button){

    var $ = S.$, ButtonGroup;
    /**
	 * Button组按钮组件，提供一系列可定制的按钮
	 * 
	 *	require(['ui/button-group'],function(ButtonGroup){
	 *		new ButtonGroup({
	 *			items:[]
	 *		});
	 *	});
     * @module ui.button-group
	 * @extends Widget
	 * @class Simple.ButtonGroup
     */
    ButtonGroup = declare('ButtonGroup', Widget, {
        /**
         * 设置按钮的焦点的索引
         * @property focusIndex
         * @type Int
         * @default 0
         */
        focusIndex: 0,
        /**
         * 设置提供按钮的数据
         * @property items
         * @type Array
         * @default []
         */
        items: [],
        /**
         * 按钮组的类名
         * @property className
         * @type String
         * @default 'simple-btn-wrap'
         */
        className: 'simple-btn-wrap',
        /**
         * 按钮悬浮时添加的样式类
         * @property hoverClass
         * @type String
         * @reayOnly
         * @default 'simple-btn-hover'
         */
        hoverClass: 'simple-btn-hover',
        /**
         * 按钮禁止时添加的样式类
         * @property disableClass
         * @type String
         * @reayOnly
         * @default 'simple-btn-disabled'
         */
        disableClass: 'simple-btn-disabled',
        /**
         * 按钮获取焦点时添加的样式类
         * @property disableClass
         * @type String
         * @reayOnly
         * @default 'simple-btn-focus'
         */
        focusClass: 'simple-btn-focus',
        
        /**
         * 渲染按钮的模版
         * @property template
         * @type String
         * @reayOnly
         * @default '<a class="simple-btn"><span widgetpoint="label"></span></a>'
         */
        template: '<a class="simple-btn"><span widgetpoint="label"></span></a>',
        /**
         * 初始化一些属性
         * @method init
         */
        init: function(){
           
            this.buttonEls = [];    
            this.buttonDisabled = [];
        },
        /**
         * 渲染按钮的方法
         * @method buildRender
         * @protected
         */
        buildRender: function(){
            var buttons = this.items;
            if (S.isArray(buttons)) {
                this._drawBtnsByArray(buttons);
            }
            else {
                this._drawBtnsByObject(buttons);
            }
        },
        /**
         * 渲染按钮通过对象的方式
         * @method _drawBtnsByObject
         * @param {Object} buttons 
         * @private
         */
        _drawBtnsByObject: function(buttons){
        
            S.each(buttons, function(item, label){
                var button = new Button({
                    label: label,
                    handle: item,
                    container: this.container
                });
                this.buttonEls.push(button.el);
            }, this);
            
        },
        /**
         * 渲染按钮通过数组的方式
         * @method _drawBtnsByObject
         * @param {Array} buttons 
         * @private
         */
        _drawBtnsByArray: function(buttons){
            var self = this;
            S.each(buttons, function(item, index){
                var handle = item.handle, label = item.label, cls = item.className, icon = item.icon, disabled = item.disabled, button;
                
                button = new Button({
                    label: label,
                    handle: handle,
                    container: this.container,
                    disable: disabled
                   
                });
                this.buttonEls.push(button.el);
            }, this);
        },
		/**
         * 启用某个按钮
         * @method enable
         * @param {Int} index 按钮在数据里的索引
         */
        enable: function(index){
            
            var currentDisabledIndex;
            this.buttonEls[index].removeClass(this.disableClass);
            
            S.each(this.buttonDisabled, function(item, i){
                if (item.index == index) {
                    this.buttonDisabled.splice(i, 1);
                    currentDisabledIndex = i - 1;
                }
            }, this);
            if (currentDisabledIndex < 0) {
                this.currentDisableIndex = null;
            }
            else {
                this.currentDisableIndex = currentDisabledIndex;
            }
            
        },
		/**
         * 禁用某个按钮
         * @method disable
         * @param {Int} index 按钮在数据里的索引
         */
        disable: function(index){
            if (this.currentDisableIndex == index) {
                return false;
            }
            this.buttonEls[index].addClass(this.disableClass);
            
            this.buttonDisabled.push({
                button: this.buttonEls[index],
                index: index
            });
            this.currentDisableIndex = index;
        },
		/**
         * 聚焦到某个按钮
         * @method setFocus
         * @param {Int} index 按钮在数据里的索引
         */
        setFocus: function(index){
            this.buttonEls[index].focus();
            this.buttonEls[index].addClass(this.focusClass);
            this.focusIndex = index;
        },
		/**
         * 获取聚焦的按钮
         * @method getFocus
         * @return {HTMLElement} button
         */
        getFocus: function(){
            return this.buttonEls[this.focusIndex];
        },
		/**
         * 获取禁用的按钮
         * @method getDisabled
         * @return {NodeList} button
         */
        getDisabled: function(){
            return this.buttonDisabled;
        },
        getCurrentDisabled: function(){
            if (this.currentDisableIndex) {
                return this.buttonEls[this.currentDisableIndex];
            }
            return null;
        },
		/**
         * 销毁该按钮组
         * @method destroy
         */
        destroy: function(){
            this.inherit(arguments);
            S.each(this.buttonEls, function(el, index){
                el.unbind();
                el.remove();
            });
            this.buttonEls = null;
            
        }
        
    });
    return ButtonGroup;
});
