define(function (require) {

    var $ = require('jquery'), declare = require('./declare'), Button = require('./button');

    /**
     * 提供可分离的按钮组件
     * @extends Simple.Button
     * @class Simple.ToggleButton
     */
    var ToggleButton = declare('ToggleButton', Button, {

        name: 'ToggleButton',

        template: '<button class="sui-button" role="button" tabindex="0">\
            <i data-role="iconElement"></i>\
            <span data-role="labelElement" class="sui-button-content"></span>\
        </button>',
        /**
         * 该按钮是否被选中
         * @property checked {Boolean}
         * @default false
         */
        checked: false,

        _onclick: function (e) {
            if (/disable/.test(e.currentTarget.className)) {
                return false;
            }
            this.set('checked', !this.get('checked'));
            this.handle.call(this, e);
        },

        _uiSetChecked: function (checked) {
            if (checked) {
                this.el.addClass('sui-state-checked');
            } else {
                this.el.removeClass('sui-state-checked');
            }
        }
    });

    return ToggleButton;
});