define(function (require) {

    var $ = require('jquery'), declare = require('./declare'), Widget = require('./widget');

    var MenuItem, Menu ,
        Popup = require('./popup');


    /**
     * 渲染每个菜单项
     * @class Simple.MenuItem
     * @extends Simple.Widget
     * @protected
     */
    MenuItem = declare('MenuItem', Widget, {

        name: 'MenuItem',
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
        template: '<li class="sui-menu-item">\
            <a class="sui-menu-node" data-role="menuNode"><i></i>\
                <span class="" data-role="menuIcon"></span>\
                <span data-role="menuLabel"></span> <em data-role="menuHelper"></em> </a>\
        </li>',

        /**
         * 为该菜单项绑定事件
         * @method bindUI
         */
        bindUI: function () {
            this.el.on({
                'click': $.proxy(this._onclick, this),
                'mouseover': $.proxy(this._onmouseover, this),
                'mouseout': $.proxy(this._onmouseout, this)
            });
        },
        /**
         * 点击事件操作
         * @method _onclick
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onclick: function (e) {
            if (e.currentTarget.className.indexOf('disable') != -1) {
                return;
            }
            this.handle.call(this, e);
        },
        /**
         * 悬浮事件操作
         * @method _onmouseover
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onmouseover: function (e) {
            this.el.addClass('sui-state-hover');
        },
        /**
         * 移出事件操作
         * @method _onmouseout
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onmouseout: function (e) {
            this.el.removeClass('sui-state-hover');
        },
        /**
         * 渲染菜单项的文字
         * @method _setterFocus
         * @param label {String} 文字
         * @protected
         * @return label
         */
        _uiSetLabel: function (label) {
            this.menuLabel.text(label);
            return label;
        },

        /**
         * 渲染菜单的帮助信息
         * @method _setterHelper
         * @param helper {String} 帮助信息
         * @protected
         * @return helper
         */
        _uiSetHelper: function (helper) {
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
        _uiSetChecked: function (checked) {
            this.el[(checked ? 'addClass' : 'removeClass')]('sui-state-checked');
            return checked;
        },
        /**
         * 渲染菜单的链接
         * @method _setterUrl
         * @param url {String} 菜单的链接
         * @protected
         * @return url
         */
        _uiSetUrl: function (url) {
            if (url) {
                this.menuNode.attr('href', url);
            }
            return url;
        },
        _uiSetIcon: function (icon) {
            if (icon) {
                this.menuIcon.removeClass().addClass(icon);
            }
            return icon;
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
    Menu = declare('Menu', [Popup], {

        name: 'Menu',

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
        template: '<div class="sui-menu" data-role="focusNode"></div>',
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
        initAttrs: function () {

            this._menuItemInc = [];
            //存储有子菜单的节点
            this._menuItemsHasChilds = [];
        },



        /**
         * 渲染该菜單
         * @method renderUI
         * @protected
         */
        renderUI: function () {
            var items = this.get('items');
            this._parseItems(items);
        },

        /**
         * 为该菜单绑定事件
         * @method bindUI
         * @protected
         */
        _bindUI: function () {
            this._menuItemsHasChilds.forEach(function (menuItem, index) {
                //延迟显示菜单
                var showTimeout, hideTimeout;
                menuItem.el.on('mouseenter', function () {
                    showTimeout = setTimeout(function () {
                        menuItem.inc.showAt(menuItem.inc.getParent().el);
                    }, 200);

                });
                menuItem.el.on('mouseleave', function () {
                    if (showTimeout) {
                        clearTimeout(showTimeout);
                    }
                    hideTimeout = setTimeout(function () {
                        menuItem.inc.hide();
                    }, 200);
                });
            }.bind(this));

        },

        _setterItems: function (items) {
            if (!this.isRender()) {
                this.render(document.body);
                this.el.hide();
            }
            this.el.empty();
            this._parseItems(items);
        },
        /**
         * 渲染该菜單
         * @method _parseItems
         * @param items {Array} 每个菜单项的数据
         * @private
         */
        _parseItems: function (items) {
            if ($.isArray(items) && items.length) {
                if (typeof items[0].title === 'string' || items[0].items) {
                    this._parseItemsByGroup(items);
                } else if (typeof items[0].label === 'string') {
                    this._parseItemsBySingle(items);
                } else {
                    throw new Error('不能识别的数据格式！');
                }
            } else {
                // throw new Error('不能识别的数据格式！');
            }
        },
        /**
         * 通过菜单组渲染该菜单
         * @method _parseItemsByGroup
         * @param items {Array} 每个菜单项的数据
         * @private
         */
        _parseItemsByGroup: function (items) {
            $.each(items, $.proxy(function (index, item) {
                //存在标题
                if (item.title) {
                    this.el.append('<h3 class="sui-menu-title">' + item.title + '</h3>');
                }
                //菜单项
                if (item.items && item.items.length) {
                    this._parseItemsBySingle(item.items);
                }

            }, this));
        },
        /**
         * 通过单个菜单渲染该菜单
         * @method _parseItemsBySingle
         * @param items {Array} 每个菜单项的数据
         * @private
         */
        _parseItemsBySingle: function (items) {
            var childContainer = $('<ul class="sui-menu-content"/>').appendTo(this.el);

            $.each(items, $.proxy(function (index, item) {
                var menuItemInc = new MenuItem($.extend(item, {
                    container: childContainer,
                    _parent: this
                }));
                if (item.childs) {
                    menuItemInc.menuNode.addClass('sui-menu-hassub');
                    var menuInc = new Menu({
                        items: item.childs,
                        container: menuItemInc.el,
                        _hasParentMenu: true,
                        _parent: menuItemInc,
                        position: 'lt rt',
                        offsetX: -5,
                        style:{
                            display:'none'
                        }
                    });
                    this._menuItemsHasChilds.push({
                        inc: menuInc,
                        el: menuItemInc.el
                    });
                }
                this._menuItemInc.push(menuItemInc);
            }, this));
        },
        /**
         * 为已有的菜单增加数据
         * @method addChild
         * @param items {Array} 每个菜单项的数据
         * @public
         */
        addChild: function (items) {
            if (!this.isRender()) {
                this.render();
            }
            this._parseItems(items);
        },
        /**
         * 获取菜单中的菜单项
         * @method getItem
         * @param index {Int} 菜单项的序列
         */
        getItem: function (index) {
            return this._menuItemInc[index];
        },


        /**
         * 销毁该菜单
         * @method destroy
         */
        destroy: function () {
            this._menuItemsHasChilds.forEach(function (menuItem) {
                menuItem.destroy();
            });
            this._menuItemsHasChilds = null;
            this.inherit(arguments);
        }
    });
    return Menu;
});
