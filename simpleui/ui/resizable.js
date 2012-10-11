define(['simple', 'widget', 'declare'], function(S, Widget, declare, css){

    var $ = S.$, Resizable;
    
    /**
     * 让一个dom元素可以被重设尺寸。
     *     
     *     require(['ui/resize'],function(){
     *         $('#test').resizable();
     *     });
     *     
     * @class Simple.Resize
     * @module ui.resize
     */
    Resizable = declare("Resize", {
        /**
         * 设置需要重设尺寸的节点
         * @property node
         * @type String | HTMLElement
         * @default ''
         */
        node: '',
        /**
         * 设置重设尺寸的方向，可选值有:
         * 
         *     "n", "ne", "e", "se", "s", "sw", "w", "nw"
         *     
         * @property direction
         * @type Array
         * @default ["e", "se", "s"]
         */
        direction: ["e", "se", "s"],
        /**
         * 设置重设尺寸的最大宽度
         * @property maxWidth
         * @type Int
         * @default null
         */
        maxWidth: null,
        /**
         * 设置重设尺寸的最小宽度
         * @property minWidth
         * @type Int
         * @default null
         */
        minWidth: null,
        /**
         * 设置重设尺寸的最小高度
         * @property minHeight
         * @type Int
         * @default null
         */
        minHeight: null,
        /**
         * 设置重设尺寸的最大高度
         * @property minWidth
         * @type Int
         * @default null
         */
        maxHeight: null,
        
        /**
         * 初始化重设尺寸的必要条件
         * @method init
         */
        init: function(){
            if (this.node) {
                this.node = $(this.node);
                var position = this.node.css("position");
                if (position == "static") {
                    this.node.css({
                        "position": "relative",
                        top: 0,
                        left: 0
                    });
                }
                this._createHandle(this.node);
                this._triggerEvent();
            }
        },
        /**
         * 销毁重设尺寸
         * @method destroy
         */
        destroy: function(){
            this.node.find(".simple-resize").off();
            this.node.find(".simple-resize").remove();
        },
        /**
         * 触发拖动事件
         * @method _triggerEvent
         * @private
         */
        _triggerEvent: function(){
            var self = this;
            $(".simple-resize", this.node).each(function(){
                var type = $(this).attr("data-event");
                $(this).mousedown(function(e){
                    e.preventDefault();
                    $(this).trigger("resize/" + type, [e, self.node]);
                    return false;
                });
            });
        },
        /**
         * 创建重设尺寸手柄
         * @method _createHandle
         * @param {HTMLElement} node 需要重设尺寸的节点
         * @private
         */
        _createHandle: function(node){
            var self = this;
            if (this.direction) {
                $.each(this.direction, function(i, item){
                    var divHandle = $('<div/>').addClass("simple-resize simple-resize-" + item).attr("data-event", item);
                    divHandle.bind("resize/" + item, function(e, event, node){
                        self._doMouseDown.apply(self, [event, node, item]);
                    });
                    node.append(divHandle);
                });
            }
        },
        /**
         * 鼠标按下的事件处理
         * @method _doMouseDown
         * @param {jQuery Event} e jQuery 包装后的Event对象
         * @param {HTMLElement} node 需要重设尺寸的节点
         * @param {String} item 重设尺寸的方向
         * @private
         */
        _doMouseDown: function(e, node, item){
            var self = this;
            this.lastX = e.pageX;
            this.lastY = e.pageY;
            this.nodeWidth = node.width();
            this.nodeHeight =node.height();
            this.top = (this.getOffset(node)).top;
            this.left = (this.getOffset(node)).left;
            $(document).mousemove(function(e){
                self._doMouseMove.apply(self, [e, node, item]);
            });
            $(document).mouseup(function(e){
                self._doMouseUp.apply(self, [e, node, item]);
            });
            return false;
        },
        /**
         * 鼠标移动的事件处理
         * @method _doMouseMove
         * @param {jQuery Event} e jQuery 包装后的Event对象
         * @param {HTMLElement} node 需要重设尺寸的节点
         * @param {String} item 重设尺寸的方向
         * @private
         */
        _doMouseMove: function(e, node, item){
            if ($(".draggable-iframeFix")[0]) {
                $(".draggable-iframeFix").show();
            }
            else {
                var iframeFixDiv = $("<div/>").css({
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    opacity: 0,
                    zIndex: 10000,
                    top: 0,
                    left: 0
                }).addClass("draggable-iframeFix");
                $(document.body).append(iframeFixDiv);
            }
            var x = e.pageX, y = e.pageY
            changeX = x - this.lastX, changeY = y - this.lastY;
            switch (item) {
                case "n":
                    node.css({
                        top: this.top + changeY,
                        height: this.nodeHeight - changeY
                    });
                    break;
                case "e":
                    node.css({
                        width: this.nodeWidth + changeX
                    });
                    break;
                case "s":
                    node.css({
                        height: this.nodeHeight + changeY
                    });
                    break;
                case "w":
                    node.css({
                        left: this.left + changeX,
                        width: this.nodeWidth - changeX
                    });
                    break;
                case "ne":
                    node.css({
                        top: this.top + changeY,
                        height: this.nodeHeight - changeY,
                        width: this.nodeWidth + changeX
                    });
                    break;
                case "se":
                    node.css({
                        height: this.nodeHeight + changeY,
                        width: this.nodeWidth + changeX
                    });
                    break;
                case "sw":
                    node.css({
                        height: this.nodeHeight + changeY,
                        left: this.left + changeX,
                        width: this.nodeWidth - changeX
                    });
                    break;
                case "nw":
                    node.css({
                        top: this.top + changeY,
                        height: this.nodeHeight - changeY,
                        left: this.left + changeX,
                        width: this.nodeWidth - changeX
                    });
                    break;
            }
        },
        /**
         * 鼠标弹起的事件处理
         * @method _doMouseUp
         * @private
         */
        _doMouseUp: function(){
            $(document).unbind("mousemove").unbind("mouseup");
            $(".draggable-iframeFix").hide();
        },
        //获取正确的left和top值
        getOffset: function(element){
            element = $(element);
            var position = element.css("position"), top, left, parentOffset, offset = element.offset(), right, bottom;
            if (position == "static") {
                element.css("position", "relative");
                top = 0;
                left = 0;
            }
            else 
                if (position == "absolute") {
                    var parent = element.parent()
                    while (parent.css("position") == "static" && !parent.is("body")) {
                        parent = parent.parent();
                    }
                    parentOffset = parent.offset();
                    top = offset.top - parentOffset.top;
                    left = offset.left - parentOffset.left;
                }
                else 
                    if (position == "fixed") {
                        top = parseFloat(element.css("top"));
                        left = parseFloat(element.css("left"));
                        if (isNaN(top)) {
                            top = offset.top - Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                        }
                        if (isNaN(left)) {
                            left = offset.left;
                        }
                    }
                    else 
                        if (position == "relative") {
                            top = parseFloat(element.css("top"));
                            left = parseFloat(element.css("left"));
                            right = parseFloat(element.css("right"));
                            bottom = parseFloat(element.css("bottom"));
                            if (isNaN(top)) {
                                if (!isNaN(bottom)) {
                                    top = -bottom
                                }
                                else {
                                    top = 0;
                                }
                            }
                            if (isNaN(left)) {
                                if (!isNaN(right)) {
                                    left = -right
                                }
                                else {
                                    left = 0;
                                }
                            }
                        }
            
            return {
                left: left,
                top: top
            }
        }
    });
    
    S.bridgeTojQuery("resizable", Resizable);
    
    return Resizable;
});
