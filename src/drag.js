define(function (require) {
    var $ = require('jquery'),
        declare = require('./declare'),
        Attribute = require('./attribute'),
        Drag;

    //拖动的时候不要选中元素
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

    //辅助获取正确的left，top值
    /**
     * 获取对象的绝对位置
     * @method getRealPos
     * @param {Object} element 需要获取位置的对象
     * @return {Object} 返回对象的top, left 值
     */
    var getRealPos = function (element) {
        var position = element.css("position"), top, left, parentOffset, offset = element.offset(), right, bottom;
        if (position == "static") {
            element.css("position", "relative");
            top = 0;
            left = 0;
        }
        else if (position == "absolute") {
            var el = element[0],
                offsetParent = el.offsetParent;
            parentOffset = $(offsetParent).offset();
            top = offset.top - parentOffset.top;
            left = offset.left - parentOffset.left;
        }
        else if (position == "fixed") {
            top = parseInt(element.css("top"), 10);
            left = parseInt(element.css("left"), 10);
            if (isNaN(top)) {
                top = offset.top - Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            }
            if (isNaN(left)) {
                left = offset.left;
            }
        }
        else if (position == "relative") {
            top = parseFloat(element.css("top"));
            left = parseFloat(element.css("left"));
            right = parseFloat(element.css("right"));
            bottom = parseFloat(element.css("bottom"));
            if (isNaN(top)) {
                if (!isNaN(bottom)) {
                    top = -bottom;
                }
                else {
                    top = 0;
                }
            }
            if (isNaN(left)) {
                if (!isNaN(right)) {
                    left = -right;
                }
                else {
                    left = 0;
                }
            }
        }

        return {
            left: left,
            top: top
        };
    }, /**
     * 获取元素的 left top right bottom
     * @method getCoordinates
     * @param {Object} element 需要获取位置的对象
     * @return {Object} 返回对象的left top right bottom值
     */
        getCoordinates = function (element) {
        var coor;
        element = $(element);
        if (element.length < 1) {
            return;
        }
        var offset = element.offset(), right = element.outerWidth() + offset.left, bottom = element.outerHeight() + offset.top;

        coor = $.extend({
            right: right,
            bottom: bottom
        }, offset);

        return coor;
    }, getWinScroll = function () {
        return {
            x: Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),
            y: Math.max(document.documentElement.scrollTop, document.body.scrollTop)
        };
    };
    /**
     * Drag模块为web应用增加类似桌面应用程序般的功能和易用性。Drag本身可以让一个Dom元素可移动，
     * 并且可以设置拖动手柄来启用拖动，也可以设置拖动的范围。Drag模块本身包括了一个放置模块，通过抛出的事件使得交互变得更加简单
     *
     *
     *         new Drag({
     *             node:'#drag-dom'
     *         });
     *
     *
     * @module drag
     * @class Simple.Drag
     * @extends Simple.Attribute
     */
    Drag = declare('Drag', Attribute, {

        /**
         * 设定需要被拖动的dom元素
         * @property node
         * @type String | HTMLElement
         * @default null
         */
        node: null,
        /**
         * 设定拖动该node时触发拖动的元素
         * @property handle
         * @type String
         * @default null
         */
        handle: null,
        /**
         * 限定拖动的范围
         * @property container
         * @type String | HTMLElement
         * @default document.body
         */
        container: document.body,
        /**
         * 拖动的时候的代理，如果为字符串则会复制原先的dom元素
         * @property proxy
         * @type String | Function
         * @default null
         */
        proxy: null,
        /**
         * 延迟多少像素触发拖动
         * @property delay
         * @type Int
         * @default 0
         */
        delay: 0,
        /**
         * 有拖动代理的情况下，该代理相对于鼠标的位置
         *
         *     atCursor:{
         *         top:-10,
         *         left:-10
         *     }
         *
         * @property atCursor
         * @type Object
         * @default null
         */
        atCursor: null,
        /**
         * 当拖动的页面存在有iframe的时候，是否修复从iframe拖动的时候出现闪烁的情况
         * @property iframeFix
         * @type Boolean
         * @default false
         */
        iframeFix: false,
        /**
         * 设定拖动的方向，可选值有both,x,y
         * @property direction
         * @type String
         * @default both
         */
        direction: 'both',
        /**
         * 设定拖动的步进
         *
         *     grid:[10,10]
         *
         * @property grid
         * @type Array
         * @default false
         */
        grid: false,
        /**
         * 设定拖动完毕后是否返回原先的位置
         * @property revert
         * @type Boolean
         * @default false
         */
        revert: false,
        /**
         * 设定拖动时候出发drop事件的元素
         * @property dropElements
         * @type String
         * @default false
         */
        dropElements: false,
        /**
         * 初始化拖动的事件
         * @method init
         * @protected
         */
        init: function () {
            if (!this.node) {
                return false;
            }
            this.node = $(this.node);
            this.currentPosition = this.node.css('position');
            var handle, self = this;
            this.dropElements = $(this.dropElements);
            handle = this.get('handle');
            handle.on('mousedown.drag', function (e) {
                if (e.target.tagName.toLowerCase() === 'input') {
                    return false;
                }
                self._movestart.apply(self, [e]);
                $(document.body).unselect(true);
            });
            //handle.trigger('mousedown.drag');
        },
        /**
         * 销毁拖动事件
         * @method destroy
         */
        destroy: function () {
            this.get('handle').off('mousedown.drag');
        },
        /**
         * 鼠标按下的时候的事件处理
         * @method _movestart
         * @param e {jQuery Event} jQuery包装后的event对象
         * @private
         */
        /**
         * 拖动开始的时候触发的事件，如果返回false，则阻止拖动
         * @event dragStart
         * @param {jQuery Event} event
         * @param {Object} context
         */
        _movestart: function (e) {
            e.stopPropagation();
            var node = this.node;
            this.lastX = e.pageX;
            this.lastY = e.pageY;
            this.lastNodeX = getRealPos(node).left;
            this.lastNodeY = getRealPos(node).top;
            this.offset = node.offset();
            this.nodeWidth = node.outerWidth();
            this.nodeHeight = node.outerHeight();
            if (this.trigger('dragStart', {
                event: e,
                context: this
            }) === false) {
                return false;
            }

            $(document).mousemove($.proxy(this._moving, this));
            $(document).mouseup($.proxy(this._movestop, this));
            this._setLimitRegion();
            //this._setIframeFix();
            if (!node.hasClass("draggable")) {
                node.addClass("draggable");
            }
            this.overed = null;
        },
        /**
         * 鼠标移动的时候的事件处理
         * @method _moving
         * @param e {jQuery Event} jQuery包装后的event对象
         * @private
         */
        /**
         * 拖动的时候触发的事件
         * @event drag
         * @param {jQuery Event} event
         * @param {Object} context 实例化后Drag的对象
         */
        _moving: function (e) {
            var node = this.node, updateEl;
            this.moveX = e.pageX;
            this.moveY = e.pageY;
            this.changeX = this.moveX - this.lastX;
            this.changeY = this.moveY - this.lastY;

            if (Math.abs(this.changeX) > this.delay && Math.abs(this.changeY) > this.delay) {
                this.draggable = true;
                $(document.body).css('cursor', 'move');
                if (this.grid) {
                    this.changeY = Math.round(this.changeY / this.grid[1]) * this.grid[1];
                    this.changeX = Math.round(this.changeX / this.grid[0]) * this.grid[0];
                }

                if (this.dragLimitRegion) {
                    if (this.offset.left + this.changeX < this.dragLimitRegion.left) {
                        this.changeX = this.dragLimitRegion.left - this.offset.left;
                    }
                    if (this.offset.left + this.changeX + this.nodeWidth > this.dragLimitRegion.right) {
                        this.changeX = this.dragLimitRegion.right - this.offset.left - this.nodeWidth;
                    }
                    if (this.offset.top + this.changeY < this.dragLimitRegion.top) {
                        this.changeY = this.dragLimitRegion.top - this.offset.top;
                    }
                    if (this.offset.top + this.changeY + this.nodeHeight > this.dragLimitRegion.bottom) {
                        this.changeY = this.dragLimitRegion.bottom - this.offset.top - this.nodeHeight;
                    }
                }

                this.left = this.lastNodeX + this.changeX;
                this.top = this.lastNodeY + this.changeY;

                if (this.proxy) {
                    this._setProxy();
                    updateEl = this.proxyEl;
                    this.updatePosition(updateEl, true);
                }
                else {
                    updateEl = node;
                    this.updatePosition(updateEl, false);
                }

                this.trigger('drag', {
                    event: e,
                    context: this
                });
                if (this.dropElements) {
                    this.checkDroppables();
                }
            }
        },
        /**
         * 鼠标弹起的时候的事件处理
         * @method _movestop
         * @param e {jQuery Event} jQuery包装后的event对象
         * @private
         */
        /**
         * 拖动停止的时候触发的事件
         * @event dragStop
         * @param {jQuery Event} event
         * @param {Object} context 实例化后Drag的对象
         */
        _movestop: function (e) {
            var updateEl;
            if (this.draggable) {
                if (this.dropElements) {
                    this.checkDroppables(true);
                }
            }
            if (this.proxy) {
                if (!this.revert) {
                    updateEl = this.node;
                    this.updatePosition(updateEl);
                }
                updateEl = this.proxyEl;
            }
            else {
                updateEl = this.node;
            }
            if (this.revert) {
                this.node.animate({
                    left: this.lastNodeX,
                    top: this.lastNodeY
                });
            }

            this.trigger('dragStop', {
                event: e,
                context: this
            });
            $(document).unbind('mousemove').unbind('mouseup');
            this.draggable = false;
            $(document.body).css({
                'cursor': 'default'
            }).unselect(false);
            if (this.proxyEl) {
                this.proxyEl.remove();
                this.proxyEl = null;
            }
        },
        /**
         * 设置拖动的范围
         * @method _setLimitRegion
         * @protected
         */
        _setLimitRegion: function () {
            var region = {};
            if (this.container) {
                if (this.container == document.body) {
                    var DOC = document.documentElement;
                    region.left = 0;
                    region.top = 0;
                    region.right = Math.max(DOC.clientWidth, DOC.scrollWidth);
                    region.bottom = Math.max(DOC.clientHeight, DOC.scrollHeight);
                }
                else {
                    var container = $(this.container);
                    region = getCoordinates(container);
                }
            }
            else {
                region = null;
            }
            this.dragLimitRegion = region;
        },
        /**
         * 设置拖动的代理
         * @method _setProxy
         * @protected
         */
        _setProxy: function () {
            if (this.proxyEl) {
                return;
            }
            var proxy = this.proxy;
            if (typeof proxy == "string") {
                this.proxyEl = this.node.clone().css({
                    "position": "absolute",
                    top: this.lastNodeY,
                    left: this.lastNodeX
                });
            }
            else if (typeof proxy == "function") {
                this.proxyEl = this.proxy.call(this.node);
                this.proxyEl.css("position", "absolute");
            }
            this.proxyEl.appendTo(document.body);
        },
        /**
         * 更新拖动的元素的位置
         * @method updatePosition
         * @param el {jQuery Object} 拖动的元素
         * @param proxy {Boolean} 是否有拖动代理
         * @protected
         */
        updatePosition: function (el, proxy) {
            var top = this.top, left = this.left;
            if (proxy) {
                top = this.offset.top + this.changeY;
                left = this.offset.left + this.changeX;
                if (this.atCursor) {
                    top = this.moveY + this.atCursor.top;
                    left = this.moveX + this.atCursor.left;
                }
            }
            if (this.direction == "both") {
                el.css({
                    top: top,
                    left: left
                });
            }
            else if (this.direction == "x") {
                el.css({
                    left: left
                });
            }
            else {
                el.css({
                    top: top
                });
            }
        },
        /**
         * 检测是否放置了元素
         * @method checkDroppables
         * @param isDrop {Boolean} 是否有放置
         * @protected
         */
        /**
         * 拖动离开放置元素时触发的事件
         * @event dragLeave
         * @param {jQuery Object} el 放置的元素
         * @param {Object} context 实例化后Drag的对象
         */
        /**
         * 拖动进入放置元素时触发的事件
         * @event dragEnter
         * @param {jQuery Object} el 放置的元素
         * @param {Object} context 实例化后Drag的对象
         */
        /**
         * 拖动放置元素时触发的事件
         * @event drop
         * @param {jQuery Object} el 放置的元素
         * @param {Object} context 实例化后Drag的对象
         */
        checkDroppables: function (isDrop) {
            var self = this;
            var overed = this.dropElements.filter(function (i, el) {
                el = $(el);
                if (self.proxy) {
                    return self.isInteract(el, self.proxyEl);
                }
                else {
                    return self.isInteract(el, self.node);
                }
            }).last();
            if (this.overed != overed[0]) {
                if (this.overed) {
                    // this.ondragleave.apply(this.node, [$(this.overed), this]);
                    this.trigger('dragLeave', this.overed);
                }
                if (overed[0]) {
                    this.trigger('dragEnter', overed);
                    // this.ondragenter.apply(this.node, [overed, this]);
                }
                this.overed = overed[0];
            }
            else {
                if (overed[0]) {
                    if (isDrop) {
                        // this.ondragdrop.apply(this.node, [overed, this]);
                        this.trigger('drop', overed);
                    }
                }
            }
        },
        getDroppableCoordinates: function (el) {
            if (el) {
                var position = getCoordinates(el);
                if (el.css("position") == "fixed") {
                    var scroll = getWinScroll();
                    position.top += scroll.y;
                    position.bottom += scroll.y;
                    position.left += scroll.x;
                    position.right += scroll.x;
                }
                return position;
            }
        },
        isInteract: function (nodeA, nodeB) {
            var a = this.getDroppableCoordinates(nodeA), b = this.getDroppableCoordinates(nodeB);
            //A top> B bottom
            //A bottom < B top
            //A right < B left
            //A left >B right
            if (a.top > b.bottom || a.bottom < b.top || a.right < b.left || a.left > b.right) {
                return false;
            }
            else {
                return true;
            }
        },
        _getterHandle: function (handle) {
            if (handle) {
                return this.node.find(handle);
            }
            else {
                return this.node;
            }
        }
    });

    return Drag;
});
