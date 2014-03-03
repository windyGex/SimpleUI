/*This is beta version*/
define(function(require) {

    var $ = require('jquery'),
        declare = require('./declare'),
        Widget = require('./widget');
    /**
     * Button组按钮组件，提供一系列可定制的按钮
     *
     *		new ButtonGroup({
     *			childs:[]
     *		});
     * @module ui.button-group
     * @extends Widget
     * @class Simple.ButtonGroup
     */
    var ButtonGroup = declare('ButtonGroup', Widget, {

        name: 'ButtonGroup',

        /**
         * 设置提供按钮的数据
         * @property items
         * @type Array
         * @default []
         */
        childs: [],

        /**
         * 渲染按钮的模版
         * @property template
         * @type String
         * @reayOnly
         */
        template: '<div class="sui-button-group"></div>',

        renderUI: function() {

            this.renderChilds();

            var children = this.getChildren();
            if (children.length < 2) {
                return false;
            }
            children.forEach(function(child,index){
                if (index === 0) {
                    child.el.addClass('sui-button-first');
                }
                if (index === children.length - 1) {
                    child.el.addClass('sui-button-last');
                }
            });
        },
        /**
         * 启用某个按钮
         * @method enable
         * @param {Int} index 按钮在数据里的索引
         */
        enable: function(index) {
            var button = this.getChildren()[index];
            button.enable();
        },
        /**
         * 禁用某个按钮
         * @method disable
         * @param {Int} index 按钮在数据里的索引
         */
        disable: function(index) {
            var button = this.getChildren()[index];
            button.disable();
        },
        /**
         * 聚焦到某个按钮
         * @method setFocus
         * @param {Int} index 按钮在数据里的索引
         */
        focus: function(index) {
            var button = this.getChildren()[index];
            button.focus();
            this._currentFocus = focus;
        },
        /**
         * 获取聚焦的按钮
         * @method getFocus
         * @return {HTMLElement} button
         */
        getFocus: function() {
            return this._currentFocus;
        }
    });
    return ButtonGroup;
});