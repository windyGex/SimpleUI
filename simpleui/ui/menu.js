define(['simple', 'widget', 'declare'], function(S, Widget, declare, css){

    var $ = S.$, MenuItem, Menu,_menuInc=[];
    
    /**
     * 渲染每个菜单项
     * @class Simple.MenuItem
     * @extends Simple.Widget
     * @protected
     */
    MenuItem = declare('MenuItem', Widget, {
        /**
         * 指定生成的容器的tagName
         * @property tagName
         * @type String
         * @default ul
         */
        tagName: 'ul',
        /**
         * 指定每个Item的文字
         * @property label
         * @type String
         * @default simple-menu
         */
        label: 'simple-menu',
        /**
         * 指定每个Item的图标
         * @property icon
         * @type String
         */
        icon: '',
        /**
         * 该菜单项的帮助信息
         * @property helper
         * @type String
         */
        helper: '',
        /**
         * 跳转的链接地址
         * @property url
         * @type String
         */
        url: '',
        /**
         * 该菜单项是否被禁用
         * @property disabled
         * @type Boolean
         * @default false
         */
        disabled: false,
        /**
         * 该菜单项是否被选中
         * @property checked
         * @type Boolean
         * @default false
         */
        checked: false,
        /**
         * 该菜单项的点击事件
         * @property handle
         * @type Function
         */
        handle: $.noop,
        /**
         * 生成该菜单的模版
         * @property template
         * @type String
         */
        template: '<li class="simple-menu-item">'+
	'<a class="simple-menu-node" widgetpoint="menuNode"> '+
		'<span widgetpoint="menuLabel"></span> '+
	'<em widgetpoint="menuHelper"></em> '+
	'</a>'+
'</li>',
        
        /**
         * 渲染该菜单项
         * @method renderUI
         */
        renderUI: function(){
        
            this.set('label', this.label);
            this.set('disabled', this.disabled);
            this.set('helper', this.helper);
            this.set('checked', this.checked);
            this.set('url', this.url);
            
        },
        /**
         * 为该菜单项绑定事件
         * @method bindUI
         */
        bindUI: function(){
            this.el.on({
                'click': $.proxy(this._onclick, this),
                'mouseover': $.proxy(this._onmouseover, this),
                'mouseout': $.proxy(this._onmouseout, this)
            })
        },
        /**
         * 点击事件操作
         * @method _onclick
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onclick: function(e){
            this.handle.call(this, e);
        },
        /**
         * 悬浮事件操作
         * @method _onmouseover
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onmouseover: function(e){
            this.el.addClass('simple-menu-item-hover');
        },
        /**
         * 移出事件操作
         * @method _onmouseout
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onmouseout: function(e){
            this.el.removeClass('simple-menu-item-hover');
        },
        /**
         * 渲染菜单项的文字
         * @method _setterFocus
         * @param label {String} 文字
         * @protected
         * @return label
         */
        _setterLabel: function(label){
            this.menuLabel.html(label);
            return label;
        },
        /**
         * 渲染菜单是否禁用
         * @method _setterDisabled
         * @param disabled {Boolean} 是否禁用该菜单
         * @protected
         * @return disabled
         */
        _setterDisabled: function(disabled){
            this.el[(disabled ? 'addClass' : 'removeClass')]('simple-menu-disabled');
            return disabled;
        },
        /**
         * 渲染菜单的帮助信息
         * @method _setterHelper
         * @param helper {String} 帮助信息
         * @protected
         * @return helper
         */
        _setterHelper: function(helper){
            this.menuHelper.html(helper);
            return helper;
        },
        /**
         * 渲染菜单是否被选中
         * @method _setterChecked
         * @param checked {Boolean} 菜单项是否被选中
         * @protected
         * @return checked
         */
        _setterChecked: function(checked){
            this.el[(checked ? 'addClass' : 'removeClass')]('simple-menu-checked');
            return checked;
        },
        /**
         * 渲染菜单的链接
         * @method _setterUrl
         * @param url {String} 菜单的链接
         * @protected
         * @return url
         */
        _setterUrl: function(url){
            if (url) {
                this.menuNode.attr('href', url);
            }
            return url;
        }
    });
    /**
     * Menu用于模拟点击桌面图标出现的菜单条目，继承于Widget类，同样Menu可以选择延迟渲染还是声明即渲染.
     * 
     *     require(['ui/menu'],function(){
     *         new Menu({
     *             items:[{label:'simple-menu'}]
     *         });
     *     });
     *     
     * @module ui.menu
     * @class Simple.Menu
     * @extends Simple.Widget
     */
    Menu = declare('Menu', Widget, {
        /**
         * 指定触发菜单显示的节点
         * @property node
         * @type String
         */
        node: '',
        /**
         * 指定渲染菜单的数据
         * @property items
         * @type Array
         */
        items: [],
        /**
         * 指定渲染菜单的父级模版
         * @property  items
         * @type String
         * @protected
         */
        template: '<div class="simple-menu"></div>',
        /**
         * 私有属性判断是否有父级菜单
         * @property  _hasParentMenu
         * @type Boolean
         * @private
         */
        _hasParentMenu: false,
        /**
         * 初始化一些属性，用来存储需要的数据
         * @method initAttrs
         */
        initAttrs: function(){
            _menuInc.push(this);
            this._menuItemInc = [];
            //存储有子菜单的节点
            this._menuItemsHasChilds = [];
        },
        initBaseEvents:function(){
             this._bindNode();  
        },
        /**
         * 渲染该菜單
         * @method renderUI
         * @protected
         */
        renderUI: function(){
        
            var items = this.get('items');
            
            this._parseItems(items);
            
            this.el.hide();
        },
        /**
         * 渲染该菜單
         * @method _parseItems
         * @param items {Array} 每个菜单项的数据
         * @private
         */
        _parseItems: function(items){
            if (S.isArray(items) && items.length) {
                if (typeof items[0].title === 'string' || items[0].items) {
                    this._parseItemsByGroup(items);
                }
                else 
                    if (typeof items[0].label === 'string') {
                        this._parseItemsBySingle(items);
                    }
                    else {
                        throw new Error('不能识别的数据格式！');
                    }
            }
            else {
                throw new Error('不能识别的数据格式！');
            }
        },
        /**
         * 通过菜单组渲染该菜单
         * @method _parseItemsByGroup
         * @param items {Array} 每个菜单项的数据
         * @private
         */
        _parseItemsByGroup: function(items){
            S.each(items, function(item, index){
                //存在标题
                if (item.title) {
                    this.el.append('<h3 class="simple-menu-title">' + item.title + '</h3>');
                }
                //菜单项
                if (item.items && item.items.length) {
                    this._parseItemsBySingle(item.items);
                }
                
            }, this);
        },
        /**
         * 通过单个菜单渲染该菜单
         * @method _parseItemsBySingle
         * @param items {Array} 每个菜单项的数据
         * @private
         */
        _parseItemsBySingle: function(items){
            var childContainer = $('<ul class="simple-menu-content"/>').appendTo(this.el);
            S.each(items, function(item, index){
                var menuItemInc = new MenuItem(S.mixin(item, {
                    container: childContainer
                }));
                if (item.childs) {
                    menuItemInc.menuNode.addClass('simple-menu-hassub');
                    var menuInc = new Menu({
                        items: item.childs,
                        container: menuItemInc.el,
                        _hasParentMenu: true
                    });
                    menuInc.hide();
                    this._menuItemsHasChilds.push({
                        inc: menuInc,
                        el: menuItemInc.el
                    });
                }
                this._menuItemInc.push(menuItemInc);
            }, this);
        },
        /**
         * 为已有的菜单增加数据
         * @method addChild
         * @param items {Array} 每个菜单项的数据
         * @public
         */
        addChild: function(items){
            this._parseItems(items);
        },
        /**
         * 获取菜单中的菜单项
         * @method getItem
         * @param index {Int} 菜单项的序列
         */
        getItem:function(index){
            return this._menuItemInc[index];
        },
        /**
         * 为该菜单绑定事件
         * @method bindUI
         * @protected
         */
        bindUI: function(){
            var self = this;
            S.each(this._menuItemsHasChilds, function(menuItem){
                //延迟显示菜单
                var showTimeout, hideTimeout;
                menuItem.el.on('mouseenter', function(){
                    showTimeout = setTimeout(function(){
                        menuItem.inc.show();
                    }, 200);
                    
                });
                menuItem.el.on('mouseleave', function(){
                    showTimeout && clearTimeout(showTimeout);
                    hideTimeout = setTimeout(function(){
                        menuItem.inc.hide();
                    }, 200);
                });
                
            }, this);
            
            //点击其他区域该菜单消失
            $(document).on('click', function(){
                self.hide();
            });
            
           // this._bindNode();
        },
        
        _bindNode: function(){
            var self = this;
            //为触发该菜单的node绑定事件
            this.node.each(function(index, node){
                $(node).on('click', function(e){
                    S.each(_menuInc,function(menuInc){
                       menuInc.el && menuInc.el.hide(); 
                    });
                    self.showAt($(node));
                    return false;
                });
            });
        },
        show:function(){
             this.inherit(arguments);
             this.fixPosition();
        },
		/**
         * 隐藏该菜单
         * @method hide
         */
        hide: function(){
                this.inherit(arguments);
                if (this._hasParentMenu) {
                    this.el.css({
                        'left': '100%',
                        'top': 0,
                        'bottom': 'auto',
                        'right': 'auto'
                    });
                }
                else {
                    this.el.css({
                        'bottom': 'auto',
                        'right': 'auto'
                    });
                }
        },
        /**
         * 菜单显示相对node位置
         * @param node {jQuery Object} 相对的参考节点
         * @method showAt
         */
        showAt: function(node){
            this.show();
            this.el.css({
                left: node.offset().left,
                top: node.offset().top + node[0].offsetHeight
            });
            
            this.fixPosition();
        },
        /**
         * 调整菜单显示的位置
         * @method fixPosition
         */
        fixPosition: function(){
            //如果水平放不下
            if (!S.isFitHorizontal(this.el)) {
                this.el.css({
                    'left': 'auto',
                    right: this.el.width()
                });
            }
            //如果垂直放不下
            if (!S.isFitVertical(this.el)) {
                this.el.css({
                    'top': 'auto',
                    bottom: 0
                });
            }
        },
		/**
		 * 销毁该菜单
		 * @method destroy
		 */
		destroy:function(){
			S.each(this._menuItemsHasChilds,function(menuItem){
				menuItem.off();
			});
			this._menuItemsHasChilds = null;
			this.inherit(arguments);
		}
    });
    /**
     * ContextMenu用于模拟右击桌面图标出现的上下文菜单，继承自Simple.Menu
     *     
     *     require(['ui/menu'],function(){
     *         new Simple.ContextMenu({
     *            node:'#context-menu',
     *            items:[{label:'simple-menu'}]
     *         });
     *     });
     *     
     * @class Simple.ContextMenu
     * @extends Simple.Menu
     */
    ContextMenu = declare('ContextMenu', Menu, {
    
        _bindNode: function(){
            var self = this;
            this.node.each(function(index, node){
                $(node).on('contextmenu', function(e){
                    self.showAt($(node), e);
                    return false;
                });
            });
        },
        /**
         * 右键菜单显示的位置
         * @param node {jQuery Object} 相对的参考节点
         * @param e {jQuery Event} 传入的jQuery包装的Event对象
         * @method showAt
         */
        showAt: function(node, e){
            this.show();
            this.el.css({
                left: e.pageX,
                top: e.pageY
            });
            
            this.fixPosition();
        }
    });
    
    S.bridgeTojQuery("contextmenu", ContextMenu);
    S.bridgeTojQuery("menu", Menu);
    
    return Menu;
});
