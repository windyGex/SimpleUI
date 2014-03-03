define(function (require) {

    var $ = require('jquery'),
        Attribute = require('./attribute'),
        declare = require('./declare'),
        _Container = require('./_container');


    var uuid = 0,
        _getId = function () {
            return 'widget-' + (uuid++)
        },
        Widget;

    /**
     * 继承自Attribute类，为所有的SimpleUI的UI组件提供基类支持，
     * 拥有`init`,`render`,`destroy`生命周期.
     * 这个基类提供了很多可以复写的方法，可以方便的实现自定义行为，从而降低工作量.
     *
     * >该类被设计为用于继承的基类，通常不会被直接实例化
     *
     * @module widget
     * @extends Simple.Attribute
     * @class Simple.Widget
     */
    Widget = declare('Widget', [Attribute, _Container], {

        name: 'Widget',

        /**
         * 该Id也为实例化后可以根据此ID获取实例对象 如果没有指定，则会自动生成一个Id，格式为widget-uuid
         *
         * @property id
         * @type String
         * @default ''
         */
        id: '',
        /**
         * 触发该widget操作的node
         *
         * @property node
         * @type String
         * @default null
         */
        node: '',
        /**
         * ui渲染的位置
         *
         * @property container
         * @type String
         * @default ''
         */
        container: '',
        /**
         * 为生成的el添加的类
         *
         * @property className
         * @type String
         * @default ''
         */
        className: '',
        /**
         * 为container指定的类名
         *
         * @property containerClass
         * @type String
         * @default ''
         */
        containerClass: '',
        /**
         * 当没有指定container时，创建container时使用的标签
         * @property tagName
         * @type String
         * @default 'div'
         */
        tagName: 'div',
        /**
         * 该widget组件需要使用的模版，可以通过外部加载
         *
         * @property template
         * @type String
         * @default ''
         */
        template: '',
        /**
         * 通过bindUI为该组件绑定事件
         *
         * @type Object
         * @property {Object} events
         */
        events: null,
        /**
         * 为该生成的el设定的样式
         *
         * @property style
         * @type Object
         */
        style: '',
        /**
         * 为该生成的el设定属性
         * @property style
         * @type Object
         */
        attr: '',
        /**
         * 初始化widget
         * @method init
         */
        init: function () {
            this.node = this.get('node');
            this.container = this.get('container');
            if (!this.get('id')) {
                this.set('id', _getId());
            }
            this.initAttrs();
            this.initBaseEvents();
            this._deferred = $.Deferred();
            this._bindAttrChange();
            if (this.container) {
                this.render();
            }
        },
        /**
         * 取得指定的node
         *
         * @method _getterTrigger
         * @protected
         */
        _getterNode: function (node) {
            return $(node);
        },
        /**
         * 取得渲染的容器
         *
         * @method _getterContainer
         * @protected
         */
        _getterContainer: function (node) {
            if (node) {
                return $(node).addClass(this.get('containerClass'));
            }
            return null;
        },
        /**
         * 用于自动生成容器的方法， 在没有渲染且没有指定容器的方法在会调用此方法
         *
         * @method _autoBuildContainer
         * @protected
         */
        _autoBuildContainer: function () {
            var node = $('<' + this.get('tagName') + '>');
            node.addClass(this.get('containerClass'));
            node.appendTo(document.body);
            // 标识是否是自动生成的dom，在destroy的时候移除掉
            this._autoContainer = true;
            this.set('container', node);
        },
        /**
         * 初始化一些特殊的属性，所有在这里初始化的属性都会被插件类捕捉到
         * @method initAttrs
         */
        initAttrs: $.noop,
        /**
         * 如果该组件是延迟渲染的，则针对el的事件绑定在这里进行
         *
         * @method initBaseEvents
         */
        initBaseEvents: $.noop,


        /**
         * 对组件进行渲染
         *
         * @method render
         * @param container {String | HTMLElement} 指定渲染到的容器
         */
        render: function (container) {

            if (!this._rendered) {
                if (container) {
                    this.set('container', $(container));
                } else {
                    if (!this.get('container')) {
                        this._autoBuildContainer();
                    }
                }
                this.createElement();
                this.buildRender();
                this._linkPropFromElement();
                this._linkAttrToElement();
                this._renderUI();
                this.renderUI();
                this._delegateEvents();
                this._bindUI();
                this.bindUI();
                this.el.removeClass('sui-hidden');
                this._rendered = true;
            }
            return this;
        },
        /**
         * 通过该方法判断该组件是否已渲染
         *
         * @method isRender
         * @return 组件是否渲染
         */
        isRender: function () {
            return !!this._rendered;
        },

        createElement: function () {
            var template = this.get('template');
            if (template) {
                this.el = $(this.get('template'));
            } else {
                this.el = this.container;
            }
        },
        /**
         * 构建渲染的主体，在这里会进行模版的解析。
         *
         * @method buildRender
         * @protected
         */
        buildRender: function () {
            var attrs = this.get('attr').split(/\s*,\s*/),
                attr;
            if (this.el.length > 1) {
                this.el = this.el.eq(0);
            }
            this.el.attr('id', this.get('id'))
                .attr('role', this.get('name').toLowerCase());
            this.el.addClass(this.get('className') + ' sui-hidden');
            this.el.css(this.get('style'));
            while ((attr = attrs.shift())) {
                attr = attr.split(/\s*=\s*/);
                if (attr && attr[0]) {
                    this.el.attr(attr[0], attr[1] || '');
                }
            }
            this.container.append(this.el);
        },

        _linkAttrToElement: function () {
            $.each(this, function (key, value) {
                var method = this['_uiSet' + key.charAt(0).toUpperCase() + key.substr(1)];
                if (key.charAt(0) != '_' && typeof method === 'function') {
                    method.call(this, this.get(key));
                }
            }.bind(this));
        },

        _linkPropFromElement: function () {
            this._widgetRoles = this.el.find('[data-role]').andSelf();
            $.each(this._widgetRoles, function (index, el) {
                var widgetRole = el.getAttribute('data-role');
                if (widgetRole) {
                    this[widgetRole] = $(el);
                }
            }.bind(this));
        },

        _renderUI: function () {
        },
        /**
         * 空方法，用于组件的复写
         *
         * @method renderUI
         */
        renderUI: function () {

        },
        _bindUI: function () {
        },
        /**
         * 空方法，用于事件的绑定
         * @method bindUI
         */
        bindUI: function () {

        },
        unbindUI: function () {

        },
        /**
         * 禁用这个组件
         * @method disable
         */
        disable: function () {
            this.set('disabled', true);
        },
        /**
         * 启用这个组件
         * @method enable
         */
        enable: function () {
            this.set('disabled', false);
        },
        /**
         * 聚焦到这个组件
         * @method focus
         */
        focus: function () {
            this.set('focusAttr', true);
        },
        /**
         * @method blur
         */
        blur: function () {
            this.set('focusAttr', false);
        },

        _uiSetDisabled: function (disabled) {
            if (disabled) {
                this.el.addClass('sui-state-disabled');
                this.el.attr({
                    'aria-disabled': true,
                    'disabled': true
                });
            } else {
                this.el.removeClass('sui-state-disabled');
                this.el.removeAttr('aria-disabled').removeAttr('disabled');
            }

        },

        _uiSetFocusAttr: function (focus) {
            if (!this.get('disabled')) {
                if (focus && this.focusNode) {
                    this.focusNode.addClass('sui-state-focus');
                } else {
                    this.focusNode.removeClass('sui-state-focus');
                }
            }
        },

        /**
         * 显示该组件，如果该组件没有被渲染，则先渲染该组件，再显示
         *
         * @method show
         */
        show: function () {
            if (!this.isRender()) {
                this.render(document.body);
            }
            this.el.show();
            setTimeout(function () {
                this.el.addClass('sui-transition');
            }.bind(this), 0);
            this.set('visible', true);
            return this;
        },
        /**
         * 隐藏该组件
         *
         * @method hide
         */
        hide: function () {
            if (this.isRender()) {
                this.el.removeClass('sui-transition')
                    setTimeout(function(){
                        this.el.hide();
                    }.bind(this),300);
                this.set('visible', false);
            }
            return this;
        },
        /**
         * 通过解析domEvents为dom元素绑定事件
         * @protected
         * @method _delegateEvents
         */
        _delegateEvents: function () {
            var events = this.get('events');
            for (var key in events) {
                var method = events[key];
                if (!$.isFunction(method))
                    method = this[events[key]];
                if (!method)
                    continue;

                var match = key.match(/^(\S+)\s*(.*)$/);
                var eventName = match[1], selector = match[2];

                method = this.proxy(method);
                eventName += '.delegateEvent' + this.name;
                if (selector === '') {
                    this.el.on(eventName, method);
                } else {
                    this.el.on(eventName, selector, method);
                }
            }
            return this;
        },
        proxy: function (method) {
            if (typeof method === 'string') {
                return $.proxy(this[method], this);
            } else {
                return $.proxy(method, this);
            }
        },

        /**
         * 销毁该组件
         * @method destroy
         */
        destroy: function () {

            this.trigger = null;
            if (this.el) {
                this.el.undelegate().remove();
            }
            // 是自动生成的container
            if (this._autoContainer) {
                this.get('container').remove();
            }
            this.el = this.container = null;
            this.off();
        }
    });

    return Widget;
});


