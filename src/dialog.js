define(function(require) {
    var $ = require('jquery'),
        declare = require('./declare'),
        Widget = require('./widget'),
        Modal = require('./modal'),
        Drag = require('./drag'),
        Position = require('./position'),
        Button = require('./button');

    var Dialog, _maxIndex = 1000,
        hasModal = false,
        _modalInc;
    /**
     * 对话框组件，提供可定制的遮罩对话框，支持多窗口,拖动等特性
     * @module dialog
     * @extends Simple.Widget
     * @class Simple.Dialog
     */
    Dialog = declare('Dialog',Widget, {
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

        content:'',
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
        className: 'sui-dialog',
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
         * @type Object
         * @see Position
         * @default
         */
        position: {
            position:'cc cc',
            reference:document.body
        },
        /**
         * 设置dialog是否可以拖动
         * @property draggable
         * @type Boolean
         * @default true
         */
        draggable: true,

        /**
         * 生成dialog的模版
         * @property template
         * @type String
         * @default template
         */
        template: '<div class="sui-dialog sui-dialog-normal">\
            <div class="sui-dialog-hd" data-role="dialogHead"> \
                <div class="sui-dialog-handle" data-role="dialogHandle"></div> \
                <h2 class="sui-dialog-title" data-role="dialogTitle"></h2>\
            </div>\
            <div class="sui-dialog-bd">\
                <div class="sui-dialog-content" data-role="dialogContent"></div>\
                <div data-role="dialogFoot"></div>\
            </div>  \
        </div>'
        ,
        /**
         * 是否启用堆栈对话框
         * @property stack
         * @type Boolean
         * @default true
         */
        stack: false,
        /**
         * 渲染dialog生成
         * @method renderUI
         */
        _renderUI: function() {

            var dialogContent;

            if (this.get('modal') || (!this.get('modal') && hasModal)) {

                if (!_modalInc) {
                    _modalInc = new Modal({
                        node: document.body
                    });
                }
                this._modalInc = _modalInc;
                this._modalInc.show();
                hasModal = true;
            }
            if (this.node.length) {
                dialogContent = this.node.clone(true);
                this.set('content',dialogContent);
            }
            //this.setFocus();
        },

        renderUI: function() {

            this.dialogContent.width(this.width).height(this.height);

            this._position = new Position($.extend({
                target: this.el
            },this.get('position')));

            this._position.setPosition();



            if (this.draggable) {
                new Drag({
                    node: this.el,
                    handle: '[data-role="dialogHead"]'
                });
            }
            if (this.stack) {
                this.el.css('z-index', _maxIndex++);
                this.constructor._stackDialog.length = this.constructor._stackDialog.dialog.push(this.el);
            }else{
                this.el.css('z-index', _maxIndex);
            }

            this.el.addClass('sui-transition');
        },
        /**
         * 渲染对话框的内容
         * @method _uiSetContent
         * @param content {String} 对话框的内容
         * @private
         */
        _uiSetContent: function(content) {

            if (this.dialogContent) {
                this.dialogContent.html(content);
            }

        },
        /**
         * 渲染对话框的标题
         * @method _uiSetTitle
         * @param title {String} 对话框的标题
         * @private
         */
        _uiSetTitle: function(title) {
            if (this.dialogTitle) {
                if (title) {
                    this.dialogTitle.html(title);
                } else {
                    this.dialogTitle.remove();
                }
            }
        },
        /**
         * 渲染对话框的工具栏
         * @method _uiSetHandleTool
         * @param tools {Array} 对话框的工具栏
         * @private
         */
        _uiSetHandleTool: function(tools) {
            if (tools.length) {
                $.each(tools, $.proxy(function(i, n) {
                    var tool = $("<a/>").addClass("sui-icon-font sui-dialog-" + n).attr("rel", "dialog" + n);
                       if(n == 'close'){
                           tool.html('&#x3496;');
                       }else{
                           tool.html(n);
                       }
                        self = this;
                    tool.click(function() {
                        if (self.trigger(n) === false) {
                            return false;
                        }
                        if (n == 'close') {
                            self.destroy();
                        } else {
                            self[n + 'Dialog']();
                        }
                    });
                    this.dialogHandle.append(tool);
                }, this));
            }
        },
        /**
         * 渲染对话框的按钮
         * @method _uiSetButtons
         * @param buttons {Array | Object} 对话框的按钮
         * @private
         * @return buttons
         */
        _uiSetButtons: function(buttons) {
            if (buttons) {
                var buttonInc = [],
                    self = this;
                var btnContainer = $("<div>").addClass("sui-dialog-button-wrap");
                this.dialogFoot.empty().append(btnContainer);
                $.each(buttons, function(index, button) {
                    buttonInc.push(new Button($.extend(button, {
                        container: btnContainer,
                        _parent: self
                    })));
                });
                this.buttonInc = buttonInc;
            }
        },
        /**
         * 为对话框绑定事件
         * @method bindUI
         * @protected
         */
        bindUI: function() {
            if (this.stack) {
                this.dialogHead.on('mousedown', $.proxy(this.setFocus, this));
            }
            $(document).on('keyup.esc', $.proxy(this.destroy, this));

            this.on('show', this.proxy(function() {
                if ($.isFunction(this.onshow)) {
                    this.onshow.call(this, this.el);
                }
            }));
            this.on('hide', this.proxy(function() {
                if ($.isFunction(this.onhide)) {
                    this.onhide.call(this, this.el);
                }
            }));
        },

        minDialog: $.noop,
        maxDialog: $.noop,

        /**
         * 将对话框隐藏
         * @method hide
         */
        hide: function() {
            if (this.get('modal')) {
                this._modalInc.hide();
            }
            this.inherit(arguments);
            return this;
        },
        /**
         * 聚焦到该对话框，只在启用多窗口时有效
         * @method setFocus
         */
        setFocus: function() {
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
        getFocus: function() {
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
        _getMaxIndex: function() {
            var zIndexList = [],
                maxIndex;
            $.each(this.constructor._stackDialog.dialog, function(index, dialog) {
                zIndexList.push(dialog.css('z-index'));
            });
            maxIndex = Math.max.apply(this, zIndexList);
            return maxIndex;
        },
        /**
         * 销毁该对话框
         * @method destroy
         */
        destroy: function() {
            if (this.buttoInc && this.buttoInc.length) {
                $.each(this.buttonInc, function(i, buttonInc) {
                    buttonInc.destroy();
                });
            }
            if (this.stack) {
                this.constructor._stackDialog.length--;
                if (!this.constructor._stackDialog.length) {
                    if (this._modalInc) {
                        this._modalInc.hide();
                    }
                    this.constructor._stackDialog.dialog = [];
                    this.constructor._stackDialog.focus = null;
                }
            } else {
                if (this._modalInc) {
                    this._modalInc.hide();
                }
            }
            this.inherit(arguments);
        },
        setPosition: function(config){
            config = config || {};
            if(config instanceof Array){
                this.el.css({
                    width: config[0],
                    height: config[1]
                });
            }else if(this._position){
                this._position.setPosition(config);
            }
        }
    });

    Dialog._stackDialog = {
        length: 0,
        dialog: [],
        focus: null,
        modal: null
    };

    //S.bridgeTojQuery("dialog", Dialog);

    /**
     * 弹出一个远程获取数据的窗口
     * @param {Object} config
     * @see Simple.Dialog
     * @static
     * @return Simple.Dialog的实例
     */
    $.ajaxDialog = Dialog.Ajax =  function(config) {

        var _ajaxDialogCache = {}, dialog, options;

        config = $.extend({
            url: '',
            data: [],
            onload: $.noop,
            loadingMessage: 'loading...'
        }, config);

        options = $.extend(config, {
            node: '<div class="sui-dialog-load">' + config.loadingMessage + '</div>'
        });

        dialog = new Dialog(options);

        dialog.el.addClass('sui-dialog-ajax');

        getHtmlByAjax(config.url, config.data, function(html) {
            dialog.set('content', html);
            dialog.setPosition(config.position || {});
            config.onload.call(dialog);
        });

        function getHtmlByAjax(url, data, callback) {
            var html = _ajaxDialogCache[url];
            if (html) {
                callback(html);
            } else {
                $.ajax({
                    url: url,
                    dataType: "html",
                    // async:true,
                    data: data,
                    success: function(r) {
                        _ajaxDialogCache[url] = r;
                        callback(r);
                    },
                    error: function() {
                        throw new Error('不能找到对应的HTML!', url);
                    }
                });
            }
        }

        return dialog;
    };

    var uuid = 0;
    /**
     * 弹出一个嵌套iframe的窗口
     * @method Simple.iframeDialog
     * @param {Object} config
     * @see Simple.Dialog
     * @static
     * @return Simple.Dialog的实例
     */
    $.iframeDialog = Dialog.Iframe = function(config) {

        var options, dialog, id = (uuid++);

        config = $.extend({
            url: '',
            onload: $.noop,
            loadingMessage: 'loading...'
        }, config);

        //options = $.extend(config, {
        // node : '<div class="simple-dialog-load">' + config.loadingMessage + '</div>' + '<iframe  class="simple-content-iframe" src="' + config.url + '" frameBorder="0" id="SimpleDialogFrame' + id + '" name="SimpleDialogFrame' + id + '" style="display:none"></iframe>'
        // });
        options = $.extend(config, {
            node: '<iframe  class="sui-content-iframe" src="' + config.url + '" frameBorder="0" id="SimpleDialogFrame' + id + '" name="SimpleDialogFrame' + id + '"></iframe>'
        });

        dialog = new Dialog(options);
        window["SimpleDialogFrame" + id].onload = function() {
            dialog.dialogContent.find(".sui-dialog-load").remove();
            dialog.dialogContent.find("iframe").fadeIn();
            dialog.setPosition(config.position || {});
            config.onload.call(this);
        };

        // window["SimpleDialogFrame"] = null;
        return dialog;

    };
    /**
     * 弹出一个警告的窗口
     * @method Dialog.Alert
     * @param {Object} config
     * @see Simple.Dialog
     * @static
     * @return Simple.Dialog的实例
     */
    $.alertDialog = Dialog.Alert = function(config) {

        config = $.extend({}, config, {
            content: '<div class="sui-dialog-alert"><i class="sui-icon-alert sui-icon-font"></i>' + config.content + '</div>',
            buttons: [{
                    label: 'OK',
                    className: 'sui-button-primary',
                    handle: function() {
                        if ((config.onsure || $.noop).call(dialog) === false) {
                            return false;
                        }
                        dialog.destroy();
                    }
                }
            ],
            title: config.title || 'Alert'
        });
        var dialog = new Dialog(config);
        return dialog;

    };

    /**
     * 弹出一个确认的窗口
     * @method Simple.confirmDialog
     * @param {Object} config
     * @see Simple.Dialog
     * @static
     * @return Simple.Dialog的实例
     */
    $.confirmDialog = Dialog.Confirm = function(config) {

        config = $.extend({}, config, {
            content: '<div class="sui-dialog-confirm"><i class="sui-icon-confirm sui-icon-font"></i>' + config.content + '</div>',
            buttons: [{
                    label: 'OK',
                    className: 'sui-button-primary',
                    handle: function() {
                        if ((config.onsure || $.noop).call(dialog) === false) {
                            return false;
                        }
                        dialog.destroy();
                    }
                }, {
                    label: 'Cancel',
                    handle: function() {
                        if ((config.oncancel || $.noop).call(dialog) === false) {
                            return false;
                        }
                        dialog.destroy();
                    }
                }
            ],
            title: config.title || 'Confirm'
        });

        var dialog = new Dialog(config);
        return dialog;

    };

    return Dialog;
});