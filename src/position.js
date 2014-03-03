/**
 * @module position
 */
define(function (require) {

    var declare = require('./declare'),
        Attribute = require('./attribute'),
        $ = require('jquery'),
        S = require('./simple');

    /**
     * @class Simple.Position
     * @extends Simple.Attribute
     */
    return declare('Position', Attribute, {

        /**
         * 设置target的x方向的偏移量
         * @property {Int} offsetX
         * @default 0
         */
        offsetX: 0,
        /**
         * 设置target的y方向的偏移量
         * @property {Int} offsetY
         * @default 0
         */
        offsetY: 0,

        position: 'lt lb',
        /**
         * 定位的目标元素
         * @property {DOM | jQuery | Selector} target
         * @default null
         */
        target: null,
        /**
         * 定位的目标元素的参照元素
         * @property {DOM | jQuery | Selector} reference
         * @default document.body
         */
        reference: document.body,


        init: function () {

            this.on('attrchange', this.setPosition);
        },

        _getReferencePosition: function () {

            var reference = this.get('reference')[0],
                target = this.get('target')[0],
                referenceInfo = S.getOuterDimensions(reference),
                offset;

            if (reference.offsetParent === target.offsetParent) {
                referenceInfo.left = reference.offsetLeft;
                referenceInfo.top = reference.offsetTop;
            } else {
                offset = $(reference).offset();
                referenceInfo.left = offset.left;
                referenceInfo.top = offset.top;
            }
            return referenceInfo;
        },

        _getTargetPosition: function () {
            return S.getOuterDimensions(this.get('target')[0]);
        },

        _getterReference: function (reference) {
            return $(reference);
        },

        _getterTarget: function (target) {
            return $(target);
        },
        /**
         * 定位的方法
         * @method setPosition
         */
        setPosition: function (config) {

            config = config || {};

            var position = config.position || this.get('position'),
                offsetX = config.offsetX || this.get('offsetX'),
                offsetY = config.offsetY || this.get('offsetY'),
                referNodeOffset = this._getReferencePosition(),
                nodeSize = this._getTargetPosition(),
                nodeWidth = nodeSize.width,
                nodeHeight = nodeSize.height,
                referNodeWidth = referNodeOffset.width,
                referNodeHeight = referNodeOffset.height;

            if (typeof position === 'string') {
                switch (position) {
                    case 'cc cc':
                        l = referNodeOffset.left + (referNodeWidth - nodeWidth) / 2;
                        t = referNodeOffset.top + (referNodeHeight - nodeHeight) / 2;
                        break;
                    case 'lt lb':
                        l = referNodeOffset.left;
                        t = referNodeOffset.top + referNodeHeight;
                        break;
                    case 'lb lt':
                        l = referNodeOffset.left;
                        t = referNodeOffset.top - nodeHeight;
                        break;
                    case 'rt rb':
                        l = referNodeWidth + referNodeOffset.left - nodeWidth;
                        t = referNodeHeight + referNodeOffset.top;
                        break;
                    case 'rb rt':
                        l = referNodeWidth + referNodeOffset.left - nodeWidth;
                        t = referNodeOffset.top - nodeHeight
                        break;
                    case 'lt rt':
                        l = referNodeWidth + referNodeOffset.left;
                        t = referNodeOffset.top;
                        break;
                    case 'lc lc':
                        l = referNodeOffset.left;
                        t = referNodeOffset.top + (referNodeHeight - nodeHeight) / 2;
                        break;
                    case 'lt lt':
                        l = referNodeOffset.left;
                        t = referNodeOffset.top;
                        break;
                }
            }

            l += offsetX;
            t += offsetY;

            this.get('target').css({
                left: l,
                top: t
            });

            return this;
        }
    });
});