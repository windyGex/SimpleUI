define(['simple', 'declare', 'widget', 'ui/modal', 'ui/drag', 'ui/button-group'], function(S, declare, Widget, Modal, Drag, Button){

    var $ = S.$, Dialog, _maxIndex = 1000, hasModal = false;
    /**
     * 对话框组件，提供可定制的遮罩对话框，支持多窗口,拖动等特性
     * @module ui.dialog
     * @extends Simple.Widget
     * @require ui.drag
     * @require ui.button-group
     * @class Simple.Dialog
     */
    Dialog = declare('Dialog', Widget, {
        /**
         * dialog 渲染的位置
         * @property container
         * @type String | HTMLElement
         * @default document.body
         */
        container: document.body,
        /**
         * 从dom中加载已有的元素到对话框中
         * @property node
         * @type String | HTMLElement
         * @default null
         */
        node: null,
        /**
         * dialog的标题,为false则不渲染标题
         *
         *     new Simple.Dialog({
         *         title:false,
         *         node:'#test'
         *     });
         * @property title
         * @type String
         * @default simple-dialog
         */
        title: 'simple-dialog',
        /**
         * dialog的附加类
         * @property className
         * @type String
         * @default 'simple-dialog'
         */
        className: 'simple-dialog',
        /**
         * 是否显示遮罩
         * @property modal
         * @type Boolean
         * @default true
         */
        modal: true,
        /**
         * 渲染显示的buttons,为false不渲染该按钮
         * @property buttons
         * @type Array | Object
         * @default false
         */
        buttons: false,
        /**
         * 渲染工具栏上面的按钮,为false则不渲染该按钮
         * @property handleTool
         * @type Array | Boolean
         * @default ['close']
         */
        handleTool: ['close'],
        /**
         * 最大化时指定的容器包裹
         * @property maxContainer
         * @type String | HTMLElement
         * @default body
         */
        maxContainer: 'body',
        /**
         * dialog的宽度
         * @property width
         * @type Int
         * @default ''
         */
        width: '',
        /**
         * dialog的高度
         * @property height
         * @type Int
         * @default ''
         */
        height: '',
        /**
         * 设置dialog初始出现的位置
         * @property position
         * @type String | Array
         * @see
         * @default 'cc cc'
         */
        position: 'cc cc',
        /**
         * 设置dialog是否可以拖动
         * @property draggable
         * @type Boolean
         * @default true
         */
        draggable: true,
        /**
         * dialog最小化时执行的事件
         * @event min
         */
        /**
         * dialog最大化时执行的事件
         * @event max
         */
        /**
         * dialog关闭时执行的事件
         * @event close
         */
        listeners:{
            min:$.noop,
            max:$.noop,
            close:$.noop
        },
        /**
         * 生成dialog的模版
         * @property template
         * @type String
         * @default template
         */
        template: '<div>' +
        '<div class="simple-dialog-arrow" widgetpoint="dialogArrow"></div>' +
        '<div class="simple-dialog-head handle" widgetpoint="dialogHead">' +
        '<h2 class="simple-dialog-title" widgetpoint="dialogTitle"></h2>' +
        '</div>' +
        '<div class="simple-dialog-cc">' +
        '<div class="simple-dialog-content" widgetpoint="dialogContent">' +
        '</div>' +
        '<div widgetpoint="dialogFoot">' +
        '</div>' +
        '</div>' +
        '</div>',
        /**
         * 是否启用堆栈对话框
         * @property stack
         * @type Boolean
         * @default true
         */
        stack: true,
        /**
         * 渲染dialog生成
         * @method renderUI
         */
        renderUI: function(){
            //this.dialog = this.el;
            var dialogContent;
            
            if (this.modal || (!this.modal && hasModal)) {
                //if($(document.body)
                this._modalInc = $(document.body).modal();
                this._modalInc.data('widget-modal').show();
                hasModal = true;
            }
            if (this.node.length) {
                dialogContent = this.node.clone(true);
                this.content = dialogContent;
            }
            
            this._renderUI();
            //this.setFocus();
        },
        
        _renderUI: function(){
        
            this.set('content', this.content);
            this.set('title', this.title);
            this.set('handleTool', this.handleTool);
            this.set('buttons', this.buttons);
            this.dialogContent.width(this.width).height(this.height);
            if (typeof this.position === 'string') {
                this.moveTo('body', this.position);
            }
            else {
                this.el.css({
                    top: position[1],
                    left: position[0]
                });
            }
            if (this.draggable) {
                this.el.drag({
                    handle: '[widgetpoint="dialogHead"]'
                });
            }
            if (this.stack) {
                this.el.css('z-index', _maxIndex++);
                this.constructor._stackDialog.length = this.constructor._stackDialog.dialog.push(this.el);
            }
        },
        /**
         * 渲染对话框的内容
         * @method _setterContent
         * @param content {String} 对话框的内容
         * @private
         * @return content
         */
        _setterContent: function(content){
        
            this.dialogContent && this.dialogContent.html(content);
            
            return content;
        },
        /**
         * 渲染对话框的标题
         * @method _setterTitle
         * @param title {String} 对话框的标题
         * @private
         * @return title
         */
        _setterTitle: function(title){
            if (this.dialogTitle) {
                if (title) {
                    this.dialogTitle.html(title);
                }
                else {
                    this.dialogTitle.remove();
                }
            }
            return title;
        },
        /**
         * 渲染对话框的工具栏
         * @method _setterHandleTool
         * @param tools {Array} 对话框的工具栏
         * @private
         * @return tools
         */
        _setterHandleTool: function(tools){
            if (tools.length) {
                S.each(tools, function(n, i){
                    var tool = $("<a/>").addClass("simple-dialog-" + n).attr("rel", "dialog" + n).html(n), self = this;
                    tool.click(function(){
                        if (self.trigger(n) === false) {
                            return false;
                        }
                        if (n == 'close') {
                            self.destroy();
                        }
                        else {
                            self[n + 'Dialog']();
                        }
                    });
                    this.dialogHead.append(tool);
                }, this);
            }
            
            return tools;
        },
        /**
         * 渲染对话框的按钮
         * @method _setterButtons
         * @param buttons {Array | Object} 对话框的按钮
         * @private
         * @return buttons
         */
        _setterButtons: function(buttons){
            if (buttons) {
                var btnContainer = $("<div>").addClass("simple-dialog-btn-wrap");
                this.dialogFoot.empty().append(btnContainer);
                this.buttonInc = new Button({
                    container: btnContainer,
                    items: buttons
                });
            }
            return buttons;
        },
        /**
         * 返回对话框按钮的实例
         * @method _getterButtons
         * @private
         * @return buttonInc
         */
        _getterButtons: function(){
            return this.buttonInc;
        },
        /**
         * 为对话框绑定事件
         * @method bindUI
         * @protected
         */
        bindUI: function(){
            if (this.stack) {
                this.dialogHead.on('mousedown', $.proxy(this.setFocus, this));
            }
            //this.el.on('keyup','Ctrl+c',$.proxy(this.destroy,this));
        },
        /**
         * 将对话框移动到某个位置
         * @param {jQuery Object} context 对话框的参考dom元素
         * @param {String} position 对话框相对context的位置
         * @param {String} offset 对话框相对context的偏移量
         */
        moveTo: function(context, position, offset){
            this.setPosition(this.el, context, position, offset);
        },
        minDialog: $.noop,
        maxDialog: $.noop,
        /**
         * 将对话框隐藏
         * @method hide
         */
        hide: function(){
            this.inherit(arguments);
            if (this.modal) {
                this._modalInc.data('widget-modal').hide();
            }
        },
        /**
         * 聚焦到该对话框，只在启用多窗口时有效
         * @method setFocus
         */
        setFocus: function(){
            if (this.stack) {
                var maxIndex = this._getMaxIndex();
                if (this.el.css('z-index') == maxIndex) {
                    return false;
                }
                this.el.css('z-index', maxIndex + 1);
                this.constructor._stackDialog.focus = this.el;
            }
        },
        /**
         * 获取当前聚焦的窗口，只在启用多窗口时有效
         * @method getFocus
         * @return jQuery Object
         */
        getFocus: function(){
            if (this.stack) {
                return this.constructor._stackDialog.focus;
            }
        },
        /**
         * 获取当前所有对话框最大的z-index值
         * @method _getMaxIndex
         * @private
         * @return z-index
         */
        _getMaxIndex: function(){
            var zIndexList = [], maxIndex;
            S.each(this.constructor._stackDialog.dialog, function(dialog){
                zIndexList.push(dialog.css('z-index'));
            });
            maxIndex = Math.max.apply(this, zIndexList);
            return maxIndex;
        },
        /**
         * 销毁该对话框
         * @method destroy
         */
        destroy: function(){
            this.inherit(arguments);
            this.buttonInc && this.buttonInc.destroy();
            if (this.stack) {
                this.constructor._stackDialog.length--;
                if (!this.constructor._stackDialog.length) {
                    this._modalInc && this._modalInc.data('widget-modal').hide();
                    this.constructor._stackDialog.dialog = [];
                    this.constructor._stackDialog.focus = null;
                }
            }
        }
    });
    
    S.Dialog._stackDialog = {
        length: 0,
        dialog: [],
        focus: null,
        modal: null
    }
    
    S.bridgeTojQuery("dialog", Dialog);
    
    /**
     * 弹出一个远程获取数据的窗口
     * @method Simple.ajaxDialog
     * @param {Object} config
     * @see Simple.Dialog
     * @static
     * @return Simple.Dialog的实例
     */
    S.ajaxDialog = $.ajaxDialog = function(config){
    
        var _ajaxDialogCache = {}, dialog, options;
        
        config = S.mixin({
            url: '',
            data: [],
            onLoad: $.noop,
            loadingMessage: 'loading...'
        }, config);
        
        options = S.mixin(config, {
            node: '<div class="simple-dialog-load">' + config.loadingMessage + '</div>'
        });
        
        dialog = new Dialog(options);
        
        dialog.el.addClass('simple-dialog-ajax');
        
        getHtmlByAjax(config.url, config.data, function(html){
            dialog.set('content', html);
            dialog.moveTo('body', config.position);
            config.onLoad.call(dialog);
        });
        
        function getHtmlByAjax(url, data, callback){
            var html = _ajaxDialogCache[url];
            if (html) {
                callback(html);
            }
            else {
                $.ajax({
                    url: url,
                    dataType: "html",
                    // async:true,
                    data: data,
                    success: function(r){
                        _ajaxDialogCache[url] = r;
                        callback(r);
                    },
                    error: function(){
                        throw new Error('不能找到对应的HTML!', url);
                    }
                });
            }
        }
        
        return dialog;
    }
    
    var uuid=0;
    /**
     * 弹出一个嵌套iframe的窗口
     * @method Simple.iframeDialog
     * @param {Object} config
     * @see Simple.Dialog
     * @static
     * @return Simple.Dialog的实例
     */
    Simple.iframeDialog = $.iframeDialog = function(config){
    
        var options, dialog,id=(uuid++);
        
        config = S.mixin({
            url: '',
            onload: $.noop,
            loadingMessage: 'loading...'
        }, config);
        
        options = S.mixin(config, {
            node: '<div class="simple-dialog-load">' + config.loadingMessage + '</div>' +
            '<iframe class="simple-content-iframe" src="' +
            config.url +
            '" frameBorder="0" name="SimpleDialogFrame'+id+'" style="display:none"></iframe>'
        });
        
        dialog = new Dialog(options);
        
        window["SimpleDialogFrame"+id].onload = function(){
                dialog.dialogContent.find(".simple-dialog-load").remove();
                dialog.dialogContent.find("iframe").fadeIn();
                dialog.moveTo('body', config.position);
                config.onload.call(this);
        }
        
        window["SimpleDialogFrame"] = null;
        
        return dialog;
        
    }
    /**
     * 弹出一个警告的窗口
     * @method Simple.alertDialog
     * @param {Object} config
     * @see Simple.Dialog
     * @static
     * @return Simple.Dialog的实例
     */
    Simple.alertDialog = $.alertDialog = function(config){
    
        config = $.extend({}, config, {
            node: '<div class="simple-dialog-alert"><i class="simple-ico simple-ico-alert"></i>' + config.node + '</div>',
            buttons: [{
                label: '确定',
                handle: function(){
                    (config.onsure || $.noop).call(dialog);
                    dialog.destroy();
                }
            }],
            title: 'System Alert'
        });
        var dialog = new Dialog(config);
        
        return dialog;
        
    }
    
    /**
     * 弹出一个确认的窗口
     * @method Simple.confirmDialog
     * @param {Object} config
     * @see Simple.Dialog
     * @static
     * @return Simple.Dialog的实例
     */
    Simple.confirmDialog = $.confirmDialog = function(config){
    
        config = $.extend({}, config, {
            node: '<div class="simple-dialog-confirm"><i class="simple-ico simple-ico-alert"></i>' + config.node + '</div>',
            buttons: [{
                label: '确定',
                handle: function(){
                    (config.onsure || $.noop).call(dialog);
                    dialog.destroy();
                }
            }, {
                label: '取消',
                handle: function(){
                    (config.oncancel || $.noop).call(dialog);
                    dialog.destroy();
                }
            }],
            title: 'System Confirm'
        });
        
        var dialog = new Dialog(config);
        
        return dialog;
        
    }
    
    return Dialog;
});
