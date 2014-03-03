define(function(require){

    var declare = require('./declare'),
        Events = require('./events'),
        $ = require('jquery');
    
    /**
     * 让一个dom元素可以被框选
     *     
     *
     *
     * @class Simple.Selectable
     */
    var Selectable = declare("Selectable", Events, {
        /**
         * 设置需要框选元素的父级容器
         * @property node
         * @type String | HTMLElement
         * @default ''
         */
        node: null,
        /**
         * node元素中的子集节点，会被选中,应该是一个jQuery选择器
         * @property selectNode
         * @type String
         * @default ''
         */
        selectNode: null,
        /**
         * 选中的元素加上的类，以表明该元素被选中了
         * @property selectCls
         * @type String
         * @default 'sui-selectable'
         */
        selectCls: 'sui-selectable',
        /**
         * 延迟触发selectable事件
         * @property delay
         * @type Int
         * @default 3
         */
        delay: 3,

        init: function(){
            $(this.node).mousedown(this._mouseDown.bind(this));
        },
        /**
         * 销毁框选特性
         * @method destroy
         */
        destroy:function(){
            $(this.node).off();
        },
        //鼠标按下
        _mouseDown: function(e){
            var self = this;
            this.trigger('selectstart',e);
            //create div to show select area
            //this._createSelectArea();
            this.lastX = e.pageX;
            this.lastY = e.pageY;
            this.hasNodeSelected = [];
            $(document).mousemove(this._mouseMove.bind(this));
            $(document).mouseup(this._mouseUp.bind(this));
            $(this.node).unselect();
            $(document.body).unselect();
        },
        _mouseMove: function(e){
            var pageX = e.pageX,
                pageY = e.pageY,
                addX = Math.abs(pageX - this.lastX),
                addY = Math.abs(pageY - this.lastY),
                self = this,
                selector;
            
            if (addX > this.delay && addY > this.delay) {
                if (!this.selectProxy) {
                    this._createSelectArea(this.lastX, this.lastY);
                }
                //更新选择范围的DIV的大小
                this.selectProxy.width(addX).height(addY);
                //当改变的值为负值时，更新选中区域的left和top值
                if (pageX - this.lastX < 0) {
                    this.selectProxy.css("left", e.pageX);
                }
                if (pageY - this.lastY < 0) {
                    this.selectProxy.css("top", e.pageY);
                }
                //判断是否与Node节点下的selectNode相交
                if (this.selectNode) {
                    selector = this.selectNode;
                }
                else {
                    selector = "*";
                }
                $(this.node).find(selector).each(function(){
                    //是否相交
                    if (self._isIntersect(this, self.selectProxy[0])) {
                        if (!$(this).attr("y-selected") == 1) {
                            $(this).addClass(self.selectCls).attr("simple-selected", 1);
                        }
                    }
                    else {
                        $(this).removeClass(self.selectCls).attr("simple-selected", 0);
                    }
                });
                this.selectstart = true;
            }
        },
        _mouseUp: function(e){
            if (this.selectstart) {
                var self = this;
                //移除创建的div
                if (this.selectProxy) {
                    this.selectProxy.remove();
                }
                var selectNode = self._getSelectedNode();
                //触发选择结束事件
                this.trigger('selectend',selectNode);
                
                this.selectProxy = null;
                this.selectstart = false;
            }
            //解除事件绑定
            $(document).unbind("mousemove").unbind("mouseup");
            $(this.node).unselect(false);
            $(document.body).unselect(false);
        },
        _getSelectedNode: function(){
            return $(this.node).find('[simple-selected=1]');
        },
        //创建一个DIV来显示选择的范围
        _createSelectArea: function(x, y){
            this.selectProxy = $("<div/>").addClass("sui-selectable-proxy");
            this.selectProxy.css({
                left: x,
                top: y
            });
            this.selectProxy.appendTo(document.body);
        },
        _isIntersect: function(nodeA, nodeB){
            var nodeAOffset = $(nodeA).offset(),
                nodeBOffset = $(nodeB).offset(),
                nodeAWidth = $(nodeA).width(),
                nodeAHeight = $(nodeA).height(),
                nodeBWidth = $(nodeB).width(),
                nodeBHeight = $(nodeB).height();

            //不相交的情况
            //A top> B bottom
            //A bottom < B top
            //A right < B left
            //A left >B right
            if (nodeAOffset.top > nodeBOffset.top + nodeBHeight ||
            nodeAOffset.top + nodeAHeight < nodeBOffset.top ||
            nodeAOffset.left + nodeAWidth < nodeBOffset.left ||
            nodeAOffset.left > nodeBOffset.left + nodeBWidth) {
                return false;
            }
            else {
                return true;
            }
        }
    });
    
    //拖动的时候不要选中元素
    if (!$.fn.unselect) {
        $.fn.unselect = function (prevent) {
            prevent = (prevent == null) ? true : prevent;
            if (prevent) {
                return this.each(function(){
                    $(this).attr('unselectable', 'on')
                        .css('user-select', 'none')
                        .on('selectstart', false);
                });
            } else {
                return this.each(function () {
                    $(this).removeAttr('unselectable', 'on')
                        .css('user-select', 'inherit')
                        .off('selectstart');
                });
            }
        };
    }

    return Selectable;
});
