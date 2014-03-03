define(function (require) {

    var $ = require('jquery'), declare = require('./declare'), Button = require('./button');
    /**
     * 提供可分离的按钮组件
     * @extends Simple.Button
     * @class Simple.DropDownButton
     */
    var DropDownButton = declare('DropDownButton', Button, {

        name: 'DropDownButton',

        hasDropDownIcon: true,
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
         */
        template: '<button class="sui-button sui-dropdown-button"  tabindex="0">\
                         <i data-role="iconElement"></i>\
                         <span data-role="labelElement"></span>\
                        <i data-role="dropdownElement" class="sui-arrow-bottom-bg" tabindex="0"></i>\
                    </button>',

        renderUI: function(){
            this.inherit(arguments);
            this.el.attr('aria-haspopup',true);
        },

        _onclick: function (e) {
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
        _uiSetHasDropDownIcon: function (hasDropDown) {
            if (hasDropDown) {
                this.dropdownElement.show();
            } else {
                this.dropdownElement.hide();
            }
        }
    });

    return DropDownButton;
});