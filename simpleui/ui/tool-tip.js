define(['simple', 'declare', 'widget', 'ui/dialog'], function(S, declare, Widget, Dialog){

    var $ = S.$, TipBase, ToolTip;
    
    /**
     * 提示功能的基类,该类可以直接被实例化，通常用于新功能提示等
     * @class Simple.TipBase
     * @extends Simple.Dialog
     * @module ui.tool-tip
     */
    TipBase = declare('TipBase', Dialog, {
        /**
         * 是否显示遮罩，默认是不应该显示遮罩的
         * @property modal
         * @type Boolean
         * @protected
         * @default false
         */
        modal: false,
        /**
         * 不启用堆栈
         * @property stack
         * @type Boolean
         * @protected
         * @default false
         */
        stack: false,
        /**
         * 默认不开启关闭按钮
         * @property handleTool
         * @type Array
         * @default false
         */
        handleTool: false,
        /**
         * tip出现的参考节点
         * @property node
         * @type String
         * @default ''
         */
        node: '',
        /**
         * 提示的内容
         * @property content
         * @type String
         * @default ''
         */
        content: '',
        /**
         * 默认不显示提示的标题
         * @property title
         * @type String
         * @default false
         */
        title: false,
        /**
         * 指定显示在node的位置
         * @property direction
         * @type String
         * @default bottom
         */
        direction: 'bottom',
        /**
         * 提示的模版
         * @property template
         * @type String
         * @default ''
         */
        template: '<div class="simple-tip-dialog"><div class="simple-dialog-arrow" widgetpoint="dialogArrow"></div><div widgetpoint="dialogContent"></div></div>',
        /**
         * 渲染提示组件
         * @method renderUI
         */
        renderUI: function(){
            this._renderUI();
            this.setMeta(this.node, this.direction);
        },
        /**
         * 根据提供的节点与相对节点的方向设置组件的一些基本信息
         * @method setMeta
         * @param {Object} node 设置信息的节点
         * @param {String} direction 设置节点的方向
         */
        setMeta: function(node, direction){
            this._setMeta(node, direction);
            this._fixPosition(node, direction);
        },
        /**
         * 根据提供的节点与相对节点的方向设置组件的一些基本信息
         * @method _setMeta
         * @private
         * @param {Object} triggerNode 设置信息的节点
         * @param {String} direction 设置节点的方向
         */
        _setMeta: function(triggerNode, direction){
        
            var meta = this._getMetaByDirection(direction);
            
            this.dialogArrow.removeClass().addClass('simple-dialog-arrow ' + meta.arrowClassName);
            
            this.setPosition(this.el, triggerNode, meta.position, meta.offset);
            
        },
        /**
         * 得到节点的位置信息
         * @method _getMetaByDirection
         * @private
         * @param {String} direction 设置节点的方向
         */
        _getMetaByDirection: function(direction){
        
            var arrowClassName, position, offset, width = this.dialogArrow.width(), height = this.dialogArrow.height();
            
            switch (direction) {
                case 'top':
                    arrowClassName = 'simple-dialog-arrow-bottom';
                    position = 'lb lt';
                    offset = '0 -' + height;
                    break;
                case 'left':
                    arrowClassName = 'simple-dialog-arrow-right';
                    position = 'rt lt';
                    offset = '-' + width + ' 0';
                    break;
                case 'bottom':
                    arrowClassName = 'simple-dialog-arrow-top';
                    position = 'lt lb';
                    offset = '0 ' + height;
                    break;
                case 'right':
                    arrowClassName = 'simple-dialog-arrow-left';
                    position = 'lt rt';
                    offset = width + ' 0';
                    break;
                default:
                    arrowClassName = 'simple-dialog-arrow-top';
                    position = 'lb lt';
            }
            
            return {
                arrowClassName: arrowClassName,
                position: position,
                offset: offset
            }
            
        },
        /**
         * 设定节点的位置
         * @method _fixPosition
         * @private
         * @param {Object} triggerNode 设置信息的节点
         * @param {String} direction 设置节点的方向
         */
        _fixPosition: function(triggerNode, direction){
        
            switch (direction) {
            
                case 'top':
                case 'bottom':
                    
                    if (!S.isFitVertical(this.el)) {
                        if (direction == 'top') {
                            direction = 'bottom';
                        }
                        else {
                            direction = 'top';
                        }
                    }
                    break;
                    
                case 'left':
                case 'right':
                    
                    if (!S.isFitHorizontal(this.el)) {
                        if (direction == 'left') {
                            direction = 'right';
                        }
                        else {
                            direction = 'left';
                        }
                    }
                    
            }
            
            this._setMeta(triggerNode, direction);
        }
    });
    
    var _toolTipInc;
    S.showToolTip = function(node, content){
        if (!_toolTipInc) {
            _toolTipInc = new TipBase({
                node: node,
                className: 'simple-tool-tip',
                container: null
            });
        }
        _toolTipInc.show();
        _toolTipInc.set('content', content);
        _toolTipInc.setMeta(node, 'bottom');
        
        return _toolTipInc;
    }
    
    S.hideToolTip = function(node){
        _toolTipInc && _toolTipInc.hide();
        
    }
    /**
     * 提示功能的类，会共享一个dom元素。
     * @class Simple.Tip
     * @extends Simple.Widget
     */
    ToolTip = declare('ToolTip', Widget, {
        /**
         * 是否允许悬浮在tip上
         * @property allowTipHover
         * @type Boolean
         * @default false
         */
        allowTipHover: false,
        /**
         * tip的内容
         * @property content
         * @type Function | String
         * @default ''
         */
        content: '',
        /**
         * 显示Tip的节点
         * @property node
         * @type  String
         * @default ''
         */
        node: '',
        /**
         * 触发tip的事件，可选值有'hover&click'
         * @property triggerEvent
         * @type String
         * @default 'hover'
         */
        triggerEvent: 'hover',
        /**
         * 初始化tip组件的事件
         * @method initBaseEvents
         */
        initBaseEvents: function(){
            if (this.triggerEvent == 'hover') {
            
                this.node.on({
                    'mouseover': $.proxy(this._onMouseOver, this),
                    'mouseout': $.proxy(this._onMouseOut, this)
                });
                
            }
            else 
                if (this.triggerEvent == 'click') {
                
                    this.node.on('click', $.proxy(this._onClick, this));
                    
                    $(document).on('click', this.hide);
                }
            
        },
        /**
         * 为该tip组件绑定事件
         * @method _bindUI
         * @private
         */
        _bindUI: function(){
        
            if (this.allowTipHover) {
            
                this.el.off('.tooltip').on({
                    'mouseover.tooltip': $.proxy(this._onElMouseOver, this),
                    'mouseout.tooltip': $.proxy(this._onElMouseOut, this)
                });
                
            }
        },
        /**
         * 设置tip的内容
         * @method _setterContent
         * @private
         */
        _setterContent: function(content){
            if (this.toolTipInc) {
                this.toolTipInc.set('content', content);
            }
            return content;
        },
        /**
         * 为el绑定点击事件
         * @method _onClick
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onClick: function(e){
            var triggerNode = $(e.currentTarget);
            this._showToolTip(triggerNode);
            return false;
        },
        /**
         * 显示tip的方法
         * @method _showToolTip
         * @param triggerNode {HTMLElement} 触发tip的dom元素
         * @private
         */
        _showToolTip: function(triggerNode){
        
            if (!this.content) {
                this._currentContent = triggerNode.attr('data-title');
                
            }
            else 
                if (typeof this.content === 'function') {
                    this._currentContent = this.content.call(triggerNode)
                }
                else {
                    this._currentContent = this.content;
                }
            if (!this._currentContent) {
                throw new Error('please give the tool-tip a content!');
            }
            this.toolTipInc = S.showToolTip(triggerNode, this._currentContent);
            this.el = this.toolTipInc.el;
            this._bindUI();
            
            
        },
        /**
         * tip的悬浮事件操作
         * @method _onMouseOver
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onMouseOver: function(e){
            var self = this;
            this._showTimeOut = setTimeout(function(){
                var triggerNode = $(e.currentTarget);
                self._showToolTip(triggerNode);
            }, 300);
        },
        /**
         * tip的鼠标移出事件操作
         * @method _onMouseOut
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onMouseOut: function(e){
            var self = this;
            if (this._showTimeOut) {
                clearTimeout(this._showTimeOut);
            }
            this._hideTimeOut = setTimeout(function(){
                S.hideToolTip();
            }, 300);
            
        },
        /**
         * el悬浮事件操作
         * @method _onElMouseOver
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onElMouseOver: function(e){
            if (this._hideTimeOut) {
                clearTimeout(this._hideTimeOut);
            }
        },
        /**
         * el的鼠标移出事件操作
         * @method _onElMouseOut
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onElMouseOut: function(e){
            var self = this;
            this._hideTimeOut = setTimeout(function(){
                S.hideToolTip();
            }, 300);
        },
        /**
         * 销毁Tip组件
         * @method destroy
         */
        destroy: function(){
            Widget.prototype.destroy.call(this);
            //$(this.triggerNode).off();
            this.el.off().remove();
        }
        
    });
    
    S.bridgeTojQuery('tooltip', ToolTip);
    
    
    
    return ToolTip;
    
});

