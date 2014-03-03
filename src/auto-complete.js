define(function (require) {

    var $ = require('jquery'), AutoComplete, //存储远程获取的数据
        declare = require('./declare'),
        Widget = require('./widget'),
        Position = require('./position'),
        STATE_HOVER_CLASS = 'sui-state-hover',
        STATE_SELECTED_CLASS = 'sui-state-selected',
        S = Simple;

    /**
     * 自动完成组件，自动完成组件继承与widget，拥有和widget一样的生命周期。
     * 同样，AutoComplete被设计为可扩展的，很方面可以基于此定制特定的自动完成组件
     *
     *        new AutoComplete({
     *			node:'#test',
     *			source:['java','javascript']
     *		});
     *
     *    });
     *
     * @module auto-complete
     * @extends Simple.Widget
     * @class Simple.AutoComplete
     */
    AutoComplete = declare('AutoComplete', Widget, {

        name:'AutoComplete',
        /**
         * 需要提供自动完成功能的dom元素
         * @property node
         * @type String | HTMLElement
         * @default ""
         */
        node: '',
        /**
         * 生成自动完成功能提供模版
         * @property template
         * @type String
         * @readOnly
         * @default "<div class="sui-autocomplete"><div widgetpoint="autoCompleteList"></div></div>"
         */
        template: '<div class="sui-autocomplete sui-popup"><div data-role="autoCompleteList"></div></div>',

        /**
         * 自动完成功能的数据源，可以为本地数据，也可以为远程数据，甚至可以自定义一个函数来提供需要的数据
         * @property source
         * @type String | Function | Array | Store
         * @default ""
         */
        source: '',
        /**
         * 在获取远程数据时为了避免输入过快造成请求过多而设置的延时
         * @property delay
         * @type int
         * @default "0"
         */
        delay: 200,
        /**
         * 在获取远程数据时为node设置的请求状态
         * @property loadingClass
         * @readOnly
         * @type String
         * @default "sui-autocomplete-loading"
         */
        loadingClass: 'sui-autocomplete-loading',


        events: {
            'mouseover [rel=autocompleteItem]': '_onItemMouseOver',
            'mouseout [rel=autocompleteItem]': '_onItemMouseOut',
            'click [rel=autocompleteItem]': '_onItemClick'
        },
        /**
         * 初始化自动完成组件需要的一些属性
         * @method initAttrs
         * @protected
         */
        initAttrs: function () {
            if (this.get('source') instanceof Array) {
                this._localSource = true;
            }
            /**
             * 在请求远程数据时将数据缓存下来，大幅提升性能
             * @readOnly
             * @type Object
             * @default "{}"
             */
            this._cacheData = {};
        },
        /**
         * 初始化自动完成组件需要的事件
         * @method initBaseEvents
         * @protected
         */
        initBaseEvents: function () {

            if (this.node.is('input')) {

                this.node.on('keyup.autocomplete', this._onNodeKeyDown.bind(this))
                    .on('click', function (e) {
                        return false;
                    })
                    .attr('autocomplete', 'off');
            }

            $(document).on('click', this.hide.bind(this));
        },

        _renderUI: function () {
            this._position = new Position({
                target: this.el,
                reference: this.node
            });
        },

        /**
         * 数据项悬浮事件的操作
         * @method _onItemMouseOver
         * @param e {Event} jQuery事件传入包装的event
         * @private
         */
        _onItemMouseOver: function (e) {
            var target = $(e.currentTarget);

            target.addClass(STATE_HOVER_CLASS)
                .siblings()
                .removeClass(STATE_HOVER_CLASS);
        },
        /**
         * 数据项鼠标移出事件的操作
         * @method _onItemMouseOut
         * @param e {Event} jQuery事件传入包装的event
         * @private
         */
        _onItemMouseOut: function (e) {
            var target = $(e.currentTarget);
            target.removeClass(STATE_HOVER_CLASS);
        },
        /**
         * 数据项点击事件的操作
         * @method _onItemClick
         * @param e {Event} jQuery事件传入包装的event
         * @private
         */
        _onItemClick: function (e) {
            var target = $(e.currentTarget);
            this.selectItem(target);
            this.trigger('select', this.lastSelectedItem);
            this.finish();
            return false;
        },
        /**
         * node点击事件的操作
         * @method _onNodeKeyDown
         * @param e {Event} jQuery事件传入包装的event
         * @private
         */
        _onNodeKeyDown: function (e) {
            this._lastKeyDown = e.keyCode;
            switch (this._lastKeyDown) {
                //pageup
                case 38:
                    if (this.active) {
                        this._prev();
                    }
                    break;
                //pagedown
                case 40:
                    if (this.active) {
                        this._next();
                    } else {
                        this.activeAutoComplete();
                    }
                    break;
                //enter
                case 9:
                case 13:
                    if (this.active) {
                        this.selectCurrent();
                    }
                    break;
                //esc
                case 27:
                    if (this.active) {
                        this.finish();
                    }
                    break;
                default:
                    this.activeAutoComplete();
            }
        },
        /**
         * 激活自动提示,在这个方法里判断是否需要延时操作
         * @method activeAutoComplete
         * @protected
         */
        activeAutoComplete: function () {

            var self = this;

            if (this._activeTimeout) {
                clearTimeout(this._activeTimeout);
            }
            //如果是本地数据源
            if (this.delay && !this._localSource) {

                this._activeTimeout = setTimeout(function () {
                    self._activeNow();
                }, this.delay);

            } else {

                this._activeNow();
            }

        },
        /**
         * 判断输入的值是否符合激动自动提示的条件
         * @method _activeNow
         * @private
         */
        _activeNow: function () {

            var value = $.trim(this.node.val());
            //为空值
            if (!value.length) {
                this.finish();
                //最后一次访问的值
                this._lastProcessVal = null;
                return;
            }
            if (value) {
                this._lastProcessVal = value;
                this._fetch(value);
            }

        },
        /**
         * 根据输入的文字获取自动提示的数据
         * @method _fetch
         * @param value {String} 输入的input的值
         * @private
         */
        _fetch: function (value) {
            var currentData,
                source = this.get('source');

            //尝试读取缓存数据
            if (this._cacheData[value]) {
                this.set('currentData', this._cacheData[value]);
                this.active = true;
                return;
            }
            if (this._localSource) {
                if (source.length) {
                    currentData = this._filter(source, value);
                    this.parse(currentData);
                }
            } else {
                //发送请求,改变input状态
                this.node.addClass(this.get('loadingClass'));
                var postData = {}, name = this.node.attr('name');
                postData[name] = value;
                if (source.name && source.name.indexOf('Store') > -1) {
                    source.find(postData, {
                        strict: false
                    }).then(function (result) {
                            this.parse(result);
                        }.bind(this));
                }
                //尝试远程获取数据
                else if (typeof source === 'string') {
                    $.get(source, postData).then(function (result) {
                        this.parse(result);
                    }.bind(this));

                } else if (typeof source === 'function') {
                    source(value, function (result) {
                        this.parse(result);
                    }.bind(this));
                }
            }
        },
        /**
         * 解析获取自动提示的数据
         * @method parse
         * @param result {Array} 获取的数据
         * @protected
         */
        parse: function (result) {
            var currentData = this.getData(result),
                hasResult = this.getDataLength(currentData);

            if (hasResult) {
                this.active = true;
                this.set('currentData', currentData);
                this._setCacheData(this._lastProcessVal, currentData);
            } else {
                this.finish();
            }
            this.node.removeClass(this.get('loadingClass'));
        },
        /**
         * 通过复写此函数得到需要的真实的数据
         * @method getData
         * @param result {Array} 获取的数据
         * @return result
         */
        getData: function (result) {
            return result;
        },
        /**
         * 通过复写此函数得到数据的真实长度以便决定是否启用自动完成
         * @method getDataLength
         * @param result {Array} 获取的数据
         * @return result.length
         */
        getDataLength: function (result) {
            return result.length;
        },
        /**
         * 根据关键字与值过滤最后需要的数据
         * @method _filter
         * @param data {Array} 获取的数据
         * @param value {String} 输入的数据
         * @private
         * @return result
         */
        _filter: function (data, value) {

            var newArr = [];
            $.each(data, function (i, n) {
                var reg = new RegExp(value, "gi");
                if (n.label) {
                    if (reg.test(n.label) || reg.test(n.value)) {
                        newArr.push(n);
                    }
                } else {
                    if (reg.test(n)) {
                        newArr.push(n);
                    }
                }
            });
            return newArr;
        },
        /**
         * 使用此方法结束本次自动提示
         * @method finish
         */
        finish: function () {
            this.active = false;
            this.currentIndex = null;
            this.hide();
        },

        formatGroup: function (lastProcessValue, data) {
            if (data.forEach) {
                data.forEach(function (item, index) {
                    this.autoCompleteList.append(this.formatItem(lastProcessValue, item, index));
                }.bind(this));
            }
        },

        formatItem: function (lastProcessValue, item, index) {
            var label;
            if ($.isPlainObject(item)) {
                if (item.label) {
                    label = item.label.replace(new RegExp(this._lastProcessVal, 'g'), "<b class='sui-autocomplete-item-hl'>" + this._lastProcessVal + "</b>");
                } else {
                    label = '';
                }
            } else {
                label = item.replace(new RegExp(this._lastProcessVal, 'g'), "<b class='sui-autocomplete-item-hl'>" + this._lastProcessVal + "</b>");
            }
            return $('<div class="sui-autocomplete-item" rel="autocompleteItem">' + label + '</div>').data('item', item);
        },

        /**
         * 此方法用来渲染当前的自动完成的数据
         * @method _setterCurrentData
         * @param currentData {Array} 获取的最后的数据
         * @return currentData
         * @private
         */
        _setterCurrentData: function (currentData) {

            this.show();
            this.autoCompleteList.empty();

            var result = this.formatGroup(this._lastProcessVal, currentData);
            if (result) {
                this.autoCompleteList.append(result);
            }
            this._position.setPosition();
            this.currentData = currentData;
        },
        /**
         * 此方法用来缓存远程获取的数据
         * @method _setCacheData
         * @param value {String} 自动提示的键值
         * @param data {Array} 远程获取的数据
         * @private
         */
        _setCacheData: function (value, data) {
            if (this._cacheData.length && this._cacheData.length > 10) {
                this._cacheData = {};
                this._cacheData.length = 0;
            }
            this._cacheData[value] = data;
            this._cacheData.length++;
        },

        _next: function () {

            this.focus(1);
        },
        _prev: function () {

            this.focus(-1);
        },
        /**
         * 此方法用来聚焦选中的数据项
         * @method focus
         * @param index {Int} 索引值
         */
        focus: function (index) {

            if (this.currentIndex == null || typeof this.currentIndex == 'undefined') {
                index = this.currentIndex = 0;

            } else {

                index = this.currentIndex + index;
            }
            this.selectItem(index);

        },
        /**
         * 此方法用来选中的数据项,在这个过程中将会触发onSelect函数与onChange函数
         * @method focus
         * @param index {Int} 索引值
         * @protected
         */
        selectItem: function (index) {
            var autoCompleteItem, val, item;
            if (index instanceof $) {
                autoCompleteItem = index;
            } else {
                var items = this.el.find('[rel="autocompleteItem"]');
                index = index < 0 ? items.length - 1 : index;
                index = index == items.length ? 0 : index;
                this.currentIndex = index;
                items.removeClass(STATE_SELECTED_CLASS);
                autoCompleteItem = items.eq(index);
                autoCompleteItem.addClass(STATE_SELECTED_CLASS);
            }
            item = this.currentData[index] || autoCompleteItem.data('item');
            val = this.getValue(item, autoCompleteItem);
            this.node.val(val);
            this.lastSelectedItem = item;
            if (this.lastSelectedValue != val) {
                this.trigger('change', this.lastSelectedItem);
                this.lastSelectedValue = val;
            }
        },
        /**
         * 获取每个数据项的值，复写此方法可以定制相关的自动完成功能
         * @method getValue
         * @param item {Item} 每条数据项
         * @return value
         */
        getValue: function (item) {
            return item.value || item.label || item[this.node.attr('name')] || item;
        },
        /**
         * 选中当前数据项
         * @method selectCurrent
         */
        selectCurrent: function () {
            this.selectItem(this.currentIndex);
            this.trigger('select', this.lastSelectedItem);
            this.finish();
        },
        /**
         * 销毁自动完成组件
         * @method destroy
         */
        destroy: function () {
            this.currentIndex = null;
            this._cacheData = null;
            this.inherit(arguments);
        }
    });

    S.bridgeTojQuery('autocomplete', AutoComplete);

    return AutoComplete;
})
;
