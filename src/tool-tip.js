define(function(require){

    var $ = require('jquery'),
        declare = require('./declare'),
        Popup = require('./popup');

    var ToolTip  = declare('ToolTip', Popup ,{

        name:'TooTip',

        triggerType:'hover',

        events:{
            'click [data-role=closeElement]':'hide'
        },

        template:'<div class="sui-popup sui-tooltip"><div data-role="toolTipArrow" class="sui-arrow"></div><div data-role="contentElement" class="sui-tooltip-bd"></div></div>',


        _renderUI: function(){
            var arrowMeta = this._getArrowMeta(this.get('direction'));
            this.toolTipArrow.addClass(arrowMeta.className);
            this.set('position',arrowMeta.position);
            this.set('offsetX',arrowMeta.offsetX);
            this.set('offsetY',arrowMeta.offsetY);
            this.inherit(arguments);
        },

        _bindUI: function(){
            this.inherit(arguments);
            this.before('show',function(){
                this.set('content',this.get('content'),{
                    forceEvent: true
                });
            });
        },

        _getArrowMeta: function(direction){

            var arrowClassName,
                offsetX,
                offsetY,
                position,
                width = this.toolTipArrow.outerWidth(),
                height = this.toolTipArrow.outerHeight();

            switch (direction) {
                case 'top':
                    arrowClassName = 'sui-arrow-bottom';
                    offsetY = -height;
                    position = 'lb lt';
                    break;
                case 'left':
                    arrowClassName = 'sui-arrow-right';
                    offsetX = -width;
                    position = 'rt lt';
                    break;
                case 'bottom':
                    arrowClassName = 'sui-arrow-top';
                    position = 'lt lb';
                    offsetY = height;
                    break;
                case 'right':
                    arrowClassName = 'sui-arrow-left';
                    position = 'lt rt';
                    offsetX = width;
                    break;
                default:
                    arrowClassName = 'sui-arrow-top';
                    position = 'lt lb';
                    offsetY = height;
            }
            return {
                className: arrowClassName,
                position: position,
                offsetX: offsetX || 0,
                offsetY: offsetY || 0
            };
        }
    });

    return ToolTip;
});