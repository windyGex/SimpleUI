define(function (require) {

    var $ = require('jquery'), declare = require('./declare'), Widget = require('./widget');

    /**
     * Button按钮组件，提供可定制的按钮
     *		new Button({
     *			label:'button',
     *			handle:function(){
     *               alert('click');
     *          }
     *		});
     * @module button
     * @extends Simple.Widget
     * @class Simple.Button
     */
    var Button = declare('Button', Widget, {

        className: 'sui-button-normal',

        name: 'Button',
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
         * @default 'sui button'
         */
        label: 'sui button',
        /**
         * 图标类
         * @property icon
         * @type String
         * @default ''
         */
        icon: false,
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
         * @default 'sui-button-group'
         */
        containerClass: 'sui-button-group',

        /**
         * 渲染按钮的模版
         * @property template
         * @type String
         * @reayOnly
         * @default '<div role="button" tabindex="0"><i data-role="iconElement"></i><span data-role="labelElement"></span></div>'
         */
        template: '<button class="sui-button"  tabindex="0"><i data-role="iconElement"></i><span data-role="labelElement"></span></button>',

        /**
         * 为生成的按钮绑定事件
         * @method bindUI
         */
        bindUI: function () {
            this.el.on('click',this._onclick.bind(this));
        },
        /**
         * 按钮的点击事件操作
         * @method _onclick
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onclick: function (e) {
            if (/disable/.test(e.currentTarget.className)) {
                return false;
            }
            this.handle.call(this, e);
        },
        /**
         * 渲染按钮的文字
         * @method _setterFocus
         * @param label {String} 按钮的文字
         * @protected
         */
        _uiSetLabel: function (label) {
            if (label) {
                this.labelElement.text(label).show();
            } else {
                this.labelElement.hide();
            }

        },
        /**
         * 渲染按钮的图标
         * @method _setterIcon
         * @param icon {String} 按钮的图标类
         * @protected
         */
        _uiSetIcon: function (icon) {

            if (this.iconElement && icon) {
                this.iconElement.removeClass().addClass('sui-icon ' + icon);
            }

        },
        /**
         * 销毁该按钮
         * @method destroy
         */
        destroy: function () {
            this.el.off();
            this.inherit(arguments);
        }
    });

    return Button;

});