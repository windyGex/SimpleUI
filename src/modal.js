define(function(require){
    var $ = require('jquery'),
        declare = require('./declare'),
        Widget = require('./widget'),
        Modal;

    var getSize = function(el, isDoc) {
        el = $(el);
        if (el.is('body')) {
            if (isDoc) {
                return getDoc();
            } else {
                return getClient();
            }
        } else {
            return {
                h: el.outerHeight(),
                w: el.outerWidth()
            };
        }
    };

    var getDoc = function() {
        return {
            h: Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight),
            w: Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth)
        };
    };
    /**
     * 获取当前页面的可视宽高
     * @return {Object} Object.h 高度
     * @return {Object} Object.w 宽度
     */
    var getClient = function() {
        return {
            h: document.documentElement.clientHeight,
            w: document.documentElement.clientWidth
        };
    };
    /**
     * 渲染一个遮罩遮住某个dom元素
     * @class Simple.Modal
     * @module modal
     * @extends Simple.Widget
     */
    Modal = declare('Modal', Widget, {

        name: 'Modal',

        container: document.body,

        template: '<div class="sui-modal"></div>',

        node: null,

        renderUI: function() {
            if (this.container.css('position') === 'static') {
                this.container.css('position', 'relative');
            }
            this.setPosition();
        },
        bindUI: function() {
            $(window).bind('resize.modal', this.proxy('setPosition'));
        },
        setPosition: function() {
            var nodeOffset = this.node.offset(),
                containerOffset = this.container.offset(),
                nodeOuterSize = getSize(this.node, true);

            this.el.css({
                top: nodeOffset.top - containerOffset.top,
                left: nodeOffset.left - containerOffset.left,
                width: nodeOuterSize.w,
                height: nodeOuterSize.h
            });
        },
        show:function(){
            this.inherit(arguments);
            this.setPosition();
        },
        destroy: function() {
            this.inherit(arguments);
            $(window).unbind('resize.modal');
        }
    });
    return Modal;
});