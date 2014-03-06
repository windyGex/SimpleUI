define(function (require) {
    var $ = require('jquery'),
        declare = require('./declare'),
        Widget = require('./widget'),
        S = require('./simple'),
        Position = require('./position'),
        support = require('./support');

    var isFitHorizontal = function (el, leftOffset) {
        var leftVal = parseInt(leftOffset, 10) || $(el).offset().left,
            scroll = S.getScroll(),
            scrollLeft = scroll.left,
            bodyWidth = S.getClient().width,
            elWidth = $(el).width();

        return (leftVal + elWidth <= bodyWidth + scrollLeft && leftVal - scrollLeft >= 0);
    };

    var isFitVertical = function (el, topOffset) {
        var topVal = parseInt(topOffset, 10) || $(el).offset().top,
            scroll = S.getScroll(),
            scrollTop = scroll.top,
            bodyHeight = S.getClient().height,
            elHeight = $(el).height();

        return (topVal + elHeight <= bodyHeight + scrollTop && topVal - scrollTop >= 0);
    };
    /**
     * 弹出层组件，提供定位功能
     * @extends Simple.Widget
     * @class Simple.Popup
     */
    var Popup = declare('Popup', Widget, {

        name: 'Popup',

        className: 'sui-popup',

        template: '<div><div data-role="contentElement"></div></div>',
        /**
         * 触发该操作的节点
         * @property node
         * @type String | jQuery
         * @default null
         */
        node: '',

        /**
         * 弹出层出现的内容
         * @property content
         * @default ''
         */
        content: '',
        /**
         * 触发的方式
         * @property triggerType
         * @default click
         */
        triggerType: 'click',


        position: 'lt lb',


        initBaseEvents: function () {
            this._bindNode();
        },


        _bindNode: function () {
            var alignNode = this.get('alignNode'),
                triggerType = this.get('triggerType');

            this.bindTrigger(this.node, alignNode, triggerType);
        },
        /**
         * 绑定触发的节点
         * @param trigger
         * @param alignNode
         * @param triggerType
         */
        bindTrigger: function (trigger, alignNode, triggerType) {

            if (triggerType) {
                if (!trigger.on) {
                    trigger = $(trigger);
                }

                var show = function (e) {
                    var currentTrigger = $(e.target), node;
                    this.currentTrigger = currentTrigger;
                    node = alignNode.length ? alignNode : this.currentTrigger;
                    this.showAt(node, e);
                    return false;
                }, hide = this.hide;

                switch (triggerType) {
                    case 'hover':
                        var showTimeout, hideTimeout;
                        trigger.on('mouseenter', function (e) {
                            showTimeout = setTimeout(show.bind(this, e), 200);
                        }.bind(this));
                        trigger.on('mouseleave', function (e) {
                            if (showTimeout) {
                                clearTimeout(showTimeout);
                            }
                            hideTimeout = setTimeout(hide.bind(this, e), 200);
                        }.bind(this));
                        break;
                    case 'focus':
                        trigger.focus(show.bind(this)).blur(hide.bind(this));
                        break;
                    default :
                        trigger.on(triggerType, show.bind(this));
                        break;
                }
            }
        },

        bindUI: function () {
            this.el.on('click', function (e) {
                e.stopPropagation();
                if (this._hideElement) {
                    this._hideElement();
                }
            }.bind(this));
            if (this.get('triggerType') == 'click') {
                $(document).on('click', this.hide.bind(this));
                $(window).on('resize', this.hide.bind(this));
            }
        },

        _uiSetContent: function (content) {
            if (this.contentElement) {
                this.contentElement.html(content);
            }
        },

        _getterContent: function (content) {
            if (typeof content === 'string') {
                return content;
            } else if (typeof content === 'function') {
                return content.call(this);
            } else {
                return content.html();
            }
            return content;
        },

        _getterAlignNode: function (alignNode) {
            return $(alignNode);
        },

        _renderUI: function () {
            this._position = new Position({
                target: this.el,
                reference: this.get('alignNode'),
                position: this.get('position'),
                offsetX: this.get('offsetX'),
                offsetY: this.get('offsetY')
            });
        },

        /**
         * 指定显示参考的节点
         * @param alignNode
         */
        showAt: function (alignNode) {

            if (this.get('visible')) {
                this.el.removeClass('sui-transition');
            }

            this.show();

            this._position.set('reference', alignNode);

            this.fixPosition();
        },
        /**
         * 修正弹出层的位置
         */
        fixPosition: function () {

            var position = this.get('position'),
                positionSplit;


            if (!isFitHorizontal(this.el)) {
                if (position.indexOf('l') >= 0) {
                    position = position.replace(/l/g, 'r');
                } else {
                    position = position.replace(/r/g, 'l');
                }
            }

            //如果垂直放不下
            if (!isFitVertical(this.el)) {
                positionSplit = position.split(' ');
                position = [positionSplit[1],positionSplit[0]].join(' ');
            }

            this._position.setPosition({
                position:position
            });
        },

        _setterPosition: function (position) {
            if (this._position) {
                this._position.set('position', position);
            }
        },

        _setterAlignNode: function (alignNode) {
            if (this._position) {
                this._position.set('reference', alignNode);
            }
        }
    });

    return Popup;
});
