define(['simple', 'declare', 'widget'], function(S, declare, Widget){

    var $ = S.$, Modal;
    
	/**
     * 渲染一个遮罩遮住某个dom元素
     * @class Simple.Modal
     * @module ui.modal
     * @extends Simple.Widget
     */
    Modal = declare('Modal', Widget, {
		
		container:document.body,
		
		template:'<div class="simple-modal"></div>',
        
        node: null,
        
        renderUI: function(){
            this.setPosition();
        },
        bindUI: function(){
            $(window).bind('resize.modal', $.proxy(this.setPosition, this));
        },
        setPosition: function(){
            var nodeOffset = this.node.offset(), nodeOuterSize = S.getSize(this.node, true);
            this.el.css(nodeOffset).css({
                width: nodeOuterSize.w,
                height: nodeOuterSize.h
            });
        },
        destroy: function(){
            this.inherit(arguments);
            $(window).unbind('resize.modal');
        }
    });
	
    S.bridgeTojQuery('modal', S.Modal);
    
	return Modal;
    
});
