define(function (require) {

    var $ = require('jquery'), declare = require('./declare'), Button = require('./button');
    /**
     * 提供可分离的按钮组件
     * @extends Simple.Button
     * @class Simple.ComboButton
     */
    var ComboButton = declare('ComboButton', Button, {

        name: 'ComboButton',
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
         */
        template: '<button class="sui-combo-button"  tabindex="0">\
            <i data-role="iconElement"></i>\
            <span data-role="labelElement" class="sui-button-content"></span>\
            <span data-role="dropdownElement" class="sui-dropdown-arrow"><i class="sui-icon sui-icon-arrow-bottom"></i></span>\
        </button>',
        /**
         * 为生成的按钮绑定事件
         * @method bindUI
         */
        bindUI: function(){
            this.labelElement.on('click',this._onclick.bind(this));
            this.dropdownElement.on('click',this._dropdownClick.bind(this));
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
            if (this.dropdown) {
                this.dropdown._parent = this._parent;
                this.dropdown.showAt(this.el);
                this.trigger('dropdownshow');
            }
        },

        /**
         * 销毁该按钮
         * @method destroy
         */
        destroy: function(){
            this.labelElement.off();
            this.dropdownElement.off();
            this.inherit(arguments);
        }
    });

    return ComboButton;
});