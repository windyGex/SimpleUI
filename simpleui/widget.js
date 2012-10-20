define(['simple', 'attribute', 'declare'], function(S, Attribute, declare){

    var uuid = 0, Widget, $ = S.$;
    
    /**
     * 继承自Attribute类，为所有的SimpleUI的UI组件提供基类支持，拥有`init`,`render`,`destroy`生命周期. 这个基类提供了很多可以复写的方法，可以方便的实现自定义行为，从而降低工作量.
     * >该类被设计为用于继承的基类，通常不会被直接实例化
     *
     * @module widget
     * @extends Simple.Attribute
     * @class Simple.Widget
     */
    Widget = declare('Widget', Attribute, {
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
         *
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
         * 实例化时需要执行的插件
         *
         * @property {Array} plugins
         * @type Array
         * @default []
         */
        plugins: [],
        
        /**
         * 该widget被实例化后出现的位置
         *
         * @property position
         * @type String
         * @default null
         */
        position: null,
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
         * 存储实例化的插件实例对象,可以通过插件的名字获取
         *
         * @property _pluginsInc
         * @type Object
         * @private
         * @default null
         */
        _pluginsInc: null,
        /**
         * 初始化widget
         *
         * @method init
         */
        init: function(){
            this.node = this.get('node');
            this.container = this.get('container');
            
            this.initAttrs();
            this.initBaseEvents();
            // 缓存该对象以便获取
            Widget._inc[this.get('id')] = this;
        },
        /**
         * 取得该实例的指定Id
         *
         * @method _getterId
         * @protected
         */
        _getterId: function(id){
            return id ? id : 'widget-' + (uuid++);
        },
        /**
         * 取得指定的node
         *
         * @method _getterNode
         * @protected
         */
        _getterNode: function(node){
            if (!(node instanceof $)) {
                return $(node);
            }
            else {
                return node;
            }
        },
        /**
         * 取得渲染的容器
         *
         * @method _getterContainer
         * @protected
         */
        _getterContainer: function(node){
            var $node;
            if (node) {
                $node = $(node);
                $node.addClass(this.get('containerClass'));
            }
            else {
                /*
                 * $node = $('<' + this.get('tagName') + '>'); $node.appendTo(document.body);
                 * //标识是否是自动生成的dom，在destroy的时候移除掉 this._autoContainer = true;
                 */
                $node = null;
            }
            
            return $node;
        },
        /**
         * 用于自动生成容器的方法， 在没有渲染且没有指定容器的方法在会调用此方法
         *
         * @method _autoBuildContainer
         * @protected
         */
        _autoBuildContainer: function(){
        
            var $node = $('<' + this.get('tagName') + '>');
            $node.addClass(this.get('containerClass'));
            $node.appendTo(document.body);
            // 标识是否是自动生成的dom，在destroy的时候移除掉
            this._autoContainer = true;
            this.container = $node;
        },
        /**
         * 初始化一些特殊的属性，所有在这里初始化的属性都会被插件类捕捉到
         *
         * @method initAttrs
         */
        initAttrs: function(){
        },
        /**
         * 在初始化后执行的方法，首先创造渲染的主体，其次调用render方法进行渲染 如果有插件，则该类的插件也会在这里实例化
         *
         * @method afterInit
         */
        /**
         * 初始化后执行的事件
         *
         * @event afterInit
         */
        afterInit: function(){
            if (this.container) {
                this.render();
            }
            /* 插件机制 */
            if (this.plugins.length) {
                S.each(this.plugins, function(name, index){
                    if (this.constructor.plugins[name]) {
                        this._pluginsInc[name] = new this.constructor.plugins[name]({
                            host: this
                        });
                    }
                }, this);
            }
            this.trigger('afterInit');
        },
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
        /**
         * 渲染前执行的事件
         *
         * @event beforeRender
         */
        /**
         * 渲染后执行的事件
         *
         * @event afterRender
         */
        render: function(container){
            if (this.trigger('beforeRender') === false) {
                return false;
            }
            if (!this._rendered) {
                if (container) {
                    this.container = $(container);
                }
                else {
                    if (!this.container) {
                        this._autoBuildContainer();
                    }
                    
                }
                this.buildRender();
                this.renderUI();
                this.el && this.el.removeClass('simple-hidden');
                if (this.trigger('afterRender') === false) {
                    return false;
                }
                this._delegateEvents();
                this.bindUI();
                this._rendered = true;
            }
        },
        /**
         * 通过该方法判断该组件是否已渲染
         *
         * @method isRender
         * @return 组件是否渲染
         */
        isRender: function(){
            return this._rendered;
        },
        /**
         * 构建渲染的主体，在这里会进行模版的解析。
         *
         * @method buildRender
         * @protected
         */
        buildRender: function(){
            var template = this.get('template');
            if (template) {
            
                template = S.replace(template, this, function(value, key){
                    if (!value) {
                        value = '';
                    }
                    return value;
                });
                
                this.el = $(template);
                // avoid page reflow
                this.el.addClass(this.get('className') + ' simple-hidden');
                this.el.css(this.style);
                
                this.container.append(this.el);
                
                this._widgetPonits = this.el.find('[widgetPoint]');
                // TODO:解析widgetType
                //this._widgetType = this.el.find('[widgetType]');
                S.each(this._widgetPonits, function(el){
                    var widgetPoint = el.getAttribute('widgetPoint');
                    if (widgetPoint) {
                        this[widgetPoint] = $(el);
                    }
                }, this);
                
               // Widget.parse(this.el);
                
            }
            else {
                this.el = this.container;
                return false;
            }
        },
        /**
         * 空方法，用于组件的复写
         *
         * @method renderUI
         */
        renderUI: function(){
        
        },
        /**
         * 空方法，用于事件的绑定
         *
         * @method bindUI
         */
        bindUI: function(){
        
        },
        /**
         * 显示该组件，如果该组件没有被渲染，则先渲染该组件，再显示
         *
         * @method show
         */
        show: function(){
            this.render(document.body);
            this.el.show();
        },
        /**
         * 隐藏该组件
         *
         * @method hide
         */
        hide: function(){
            if (this.el) {
                this.el.hide();
            }
        },
        /**
         * 通过解析domEvents为dom元素绑定事件
         *
         * @protected
         * @method _dispatchEvents
         */
        _delegateEvents: function(){
            var events = this.get('events');
            if (!events) {
                return;
            }
            S.each(events, function(handle, selector){
                S.each(handle, function(callback, eventType){
                    this.el.delegate(selector, eventType, $.proxy(this[callback], this));
                }, this);
            }, this);
        },
        /**
         * 设定widget的位置
         *
         * @method setPosition
         * @param {jQuery Object} node 需要设定的节点
         * @param {jQuery Object} context 设定节点位置的参考节点
         * @param {String | Array} position 节点的位置
         * @param {Object} offset 节点相对位置的偏移量
         */
        setPosition: function(node, context, position, offset){
            if (position) {
                if (typeof position === "string") {
                    S.position.at({
                        node: node,
                        context: context,
                        position: position,
                        offset: offset
                    });
                }
                else {
                    node.css({
                        top: position[1],
                        left: position[0]
                    });
                }
            }
            else {
                S.position.atBody(node);
            }
        },
        /**
         * 销毁该组件
         *
         * @method destroy
         */
        /**
         * 销毁前执行的事件
         *
         * @event beforeDestory
         */
        /**
         * 销毁后执行的事件
         *
         * @event afterDestory
         */
        destroy: function(){
            if (this.trigger('beforeDestory') === false) {
                return false;
            }
            this.node = null;
            if (this.el) {
                this.el.undelegate();
                this.el.remove();
            }
            // 是自动生成的container
            if (this._autoContainer) {
                this.container.remove();
            }
            this.el = null;
            this.container = null;
            this.off();
            if (this._pluginInc) {
                S.each(this._pluginInc, function(cacheInc){
                    cacheInc.destroy && cacheInc.destroy();
                });
            }
            this.trigger('afterDestory');
        }
    });
    
    Widget._inc = {};
    /**
     * 通过Id取得实例化的对象，如果该Id不存在则自动生成一个
     *
     * @method Widget.byId
     * @static
     * @param {Object} id
     * @return Widget组件的实例
     */
    Widget.byId = function(id){
        return Widget._inc[id];
    }
});
