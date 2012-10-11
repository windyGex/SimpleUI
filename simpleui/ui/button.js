define(['simple', 'declare', 'widget'], function(S, declare, Widget){

    var $ = S.$, Button, ComboButton, DropDownButton;
    /**
     * Button按钮组件，提供可定制的按钮
     * 
     *	require(['ui/button'],function(Button){
     *		new Button({
     *			label:'button',
     *			handle:function(){
     *               alert('click');
     *          }
     *		});
     *	});
     *
     * @module ui.button
     * @extends Simple.Widget
     * @class Simple.Button
     */
    Button = declare('Button', Widget, {
    
        /**
         * 是否获取焦点
         * @property  focus
         * @type Boolean
         * @default false
         */
        focus: false,
        /**
         * 按钮中的文字
         * @property  label
         * @type String
         * @default 'simple-btn'
         */
        label: 'simple-btn',
        /**
         * 图标类
         * @property icon
         * @type String
         * @default ''
         */
        icon: '',
        /**
         * 按钮的监听事件
         * @property  handle
         * @type Function
         */
        handle: $.noop,
        /**
         * 按钮是否被禁用
         * @property  disabled
         * @type Boolean
         * @default false
         */
        disabled: false,
        /**
         * 放置按钮容器的地点的类
         * @property containerClass
         * @type String
         * @reayOnly
         * @default 'simple-btn-wrap'
         */
        containerClass: 'simple-btn-wrap',
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
         * @default '<div class="simple-btn"><span widgetpoint="labelEl"></span></div>'
         */
        template: '<div class="simple-btn"><span widgetpoint="labelEl"></span></div>',
        /**
         * 渲染该按钮
         * @method renderUI
         */
        renderUI: function(){
        
            this.set('label', this.label);
            this.set('icon', this.icon);
            this.set('disable', this.disable);
            this.set('focus', this.focus);
            
        },
        /**
         * 为生成的按钮绑定事件
         * @method bindUI
         */
        bindUI: function(){
            this.el.on({
                'click': $.proxy(this._onclick, this),
                'mouseover': $.proxy(this._onmouseover, this),
                'mouseout': $.proxy(this._onmouseout, this)
            });
        },
        /**
         * 按钮的点击事件操作
         * @method _onclick
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onclick: function(e){
            var $this = $(e.currentTarget);
            
            if (/disable/.test(e.currentTarget.className)) {
                return false;
            }
            this.handle.call(e.currentTarget, e);
        },
        /**
         * 按钮的悬浮事件操作
         * @method _onmouseover
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onmouseover: function(e){
            var $this = $(e.currentTarget);
            $this.addClass(this.hoverClass);
        },
        /**
         * 按钮的移出事件操作
         * @method _onmouseout
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onmouseout: function(e){
            var $this = $(e.currentTarget);
            $this.removeClass(this.hoverClass);
        },
        /**
         * 渲染按钮是否禁用
         * @method _setterDisabled
         * @param disabled {Boolean} 是否禁用该按钮
         * @protected
         * @return disabled
         */
        _setterDisabled: function(disabled){
            if (disabled) {
                this.el.addClass(this.disableClass);
            }
            else {
                this.el.removeClass(this.disableClass);
            }
            return disabled;
        },
        /**
         * 渲染按钮是否获取焦点
         * @method _setterFocus
         * @param focus {Boolean} 是否让按钮获取焦点
         * @protected
         * @return focus
         */
        _setterFocus: function(focus){
            if (this.disable) {
                return false;
            }
            if (focus) {
                this.el.addClass(this.focusClass);
            }
            else {
                this.el.removeClass(this.focusClass);
            }
            return focus;
        },
        /**
         * 渲染按钮的文字
         * @method _setterFocus
         * @param label {String} 按钮的文字
         * @protected
         * @return label
         */
        _setterLabel: function(label){
            this.labelEl.text(label);
            return label;
        },
        /**
         * 渲染按钮的图标
         * @method _setterIcon
         * @param icon {String} 按钮的图标类
         * @protected
         * @return icon
         */
        _setterIcon: function(icon){
            var iconEl = this.el.find['widgetpoint=iconEl'];
            if (iconEl && iconEl.length) {
                iconEl.removeClass().addClass('simple-ico ' + icon);
            }
            else {
                this.el.prepend('<span class="' + this.icon + ' simple-ico" widgetpoint="iconEl"></span>')
            }
            return icon;
        },
        /**
         * 销毁该按钮
         * @method destroy
         */
        destroy: function(){
            this.el.off();
            this.inherit(arguments);
        }
    });
    
    /**
     * 提供可分离的按钮组件
     * @extends Simple.Button
     * @class Simple.ComboButton
     */
    ComboButton = declare('ComboButton', Button, {
        /**
         * 下拉菜单的实例
         * @property dropdown
         * @type Menu
         * @default null
         */
        dropdown: null,
        /**
         * 分离按钮的模板
         * @property template
         * @type String
         * @default comboBtnTemplate
         */
        template: '<div class="simple-combo-btn">' +
        '<span widgetpoint="labelEl" class="simple-btn-content"></span>' +
        '<span widgetpoint="dropdownEl" class="simple-btn-arrow">' +
        '<i></i>' +
        '</span>' +
        '</div>',
        /**
         * 为生成的按钮绑定事件
         * @method bindUI
         */
        bindUI: function(){
        
            this.labelEl.on({
                'click': $.proxy(this._onclick, this),
                'mouseover': $.proxy(this._onmouseover, this),
                'mouseout': $.proxy(this._onmouseout, this)
            });
            
            this.dropdownEl.on({
                'click': $.proxy(this._dropdownClick, this),
                'mouseover': $.proxy(this._onmouseover, this),
                'mouseout': $.proxy(this._onmouseout, this)
            });
            
        },
        /**
         * 为按钮的下拉部分绑定操作
         * @method _dropdownClick
         * @param e {Event} jQuery包装的Event
         */
        _dropdownClick: function(e){
            e.stopPropagation();
            if (/disable/.test(e.currentTarget.className)) {
                return false;
            }
            var $this = $(e.currentTarget);
            if (this.dropdown) {
                this.dropdown.showAt(this.el);
            }
        },
        /**
         * 渲染按钮是否禁用
         * @method _setterDisabled
         * @param disabled {Boolean} 是否禁用该按钮
         * @return disabled
         */
        _setterDisabled: function(disable){
            if (disable) {
                this.el.addClass(this.disableClass);
                this.labelEl.addClass(this.disableClass);
                this.dropdownEl.addClass(this.disableClass);
            }
            else {
                this.el.removeClass(this.disableClass);
                this.labelEl.removeClass(this.disableClass);
                this.dropdownEl.removeClass(this.disableClass);
            }
            return disable
        },
        /**
         * 销毁该按钮
         * @method destroy
         */
        destroy: function(){
            this.inherit(arguments);
            this.labelEl.off();
            this.dropdownEl.off();
        }
    });
    /**
     * 提供可分离的按钮组件
     * @extends Simple.Button
     * @class Simple.DropDownButton
     */
    DropDownButton = declare('DropDownButton', Button, {
        /**
         * 下拉菜单的实例
         * @property dropdown
         * @type Menu
         * @default null
         */
        dropdown: null,
        /**
         * 下拉按钮的模板
         * @property template
         * @type String
         * @default comboBtnTemplate
         */
        template: '<div class="simple-btn"><span widgetpoint="labelEl"></span><span widgetpoint="dropdownEl" class="simple-btn-arrow"><i></i></span></div>',
        
        
        
        renderUI: function(){
            this.inherit(arguments);
            this.el.addClass('simple-dropdown-btn');
        },
        
        _onclick: function(e){
            e.stopPropagation();
            if (/disable/.test(e.currentTarget.className)) {
                return false;
            }
            var $this = $(e.currentTarget);
            if (this.dropdown) {
                this.dropdown.showAt(this.el);
            }
        }
    });
    
    return Button;
});
