define(['simple', 'declare', 'widget'], function(S, declare, Widget){

    var $ = S.$, AutoComplete, //存储远程获取的数据
	_cacheData = {};
    
    /**
	 * 自动完成组件，自动完成组件继承与widget，拥有和widget一样的生命周期。
	 * 同样，AutoComplete被设计为可扩展的，很方面可以基于此定制特定的自动完成组件
	 * 
	 *	require(['ui/auto-complete'],function(AutoComplete){
	 *		new AutoComplete({
	 *			node:'#test',
	 *			source:['java','javascript']
	 *		});
	 *		//或者
	 *		$('#test').autocomplete({
	 *			source:['java','javascript']
	 *		});
	 *
	 *	});
	 *
     * @module ui.auto-complete
	 * @extends Simple.Widget
	 * @class Simple.AutoComplete
     */
    AutoComplete = declare('AutoComplete', Widget, {
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
         * @default "<div class="simple-autocomplete"><div widgetpoint="autoCompleteList"></div></div>"
         */
        template: '<div class="simple-autocomplete"><div widgetpoint="autoCompleteList"></div></div>',
        
        /**
         * 自动完成功能的数据源，可以为本地数据，也可以为远程数据，甚至可以自定义一个函数来提供需要的数据
         * @property source
         * @type String | Function | Array
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
         * @default "simple-autocomplete-loading"
         */
        loadingClass: 'simple-autocomplete-loading',
        /**
         * 鼠标经过自动完成的提示时出现的状态
         * @property hoverClass
         * @readOnly
         * @type String
         * @default "simple-autocomplete-hover"
         */
        hoverClass: 'simple-autocomplete-hover',
        
        /**
         * 在选中自动完成的数据项时触发的函数
         * @event select
         * @param {String} value 选中的值
         */
         /**
         * 在选中自动完成的数据项时触发的函数
         * @event change
         * @param {String} value 改变的值
         */
        listeners:{
            'select':$.noop,
            'change':$.noop
        },
        /**
         * 在请求远程数据时将数据缓存下来，大幅提升性能
         * @private
         * @property _cacheData
         * @readOnly
         * @type Object
         * @default "{}"
         */
        _cacheData: {},
        /**
         * 初始化自动完成组件需要的一些属性
         * @method initAttrs
         * @protected
         */
        initAttrs: function(){
            if (this.source instanceof Array) {
                this._localSource = true;
            }
        },
        /**
         * 初始化自动完成组件需要的事件
         * @method initBaseEvents
         * @protected
         */
        initBaseEvents: function(){
        
            this.node.on('keyup.autocomplete', $.proxy(this._onNodeKeyDown, this));
			
			this.node.on('click',function(e){
				return false;
			});
			
			$(document).on('click',$.proxy(this.hide, this));
        },
        /**
         * 在生成dom后为数据项绑定事件
         * @method bindUI
         * @protected
         */
        bindUI: function(){
            this.el.delegate('[rel=autocompleteItem]', 'mouseover', $.proxy(this._onItemMouseOver, this));
            this.el.delegate('[rel=autocompleteItem]', 'mouseout', $.proxy(this._onItemMouseOut, this));
            this.el.delegate('[rel=autocompleteItem]', 'click', $.proxy(this._onItemClick, this));
        },
        /**
         * 数据项悬浮事件的操作
         * @method _onItemMouseOver
         * @param e {Event} jQuery事件传入包装的event
         * @private
         */
        _onItemMouseOver: function(e){
            var target = $(e.currentTarget);
            target.addClass(this.hoverClass).siblings().removeClass(this.hoverClass);
        },
        /**
         * 数据项鼠标移出事件的操作
         * @method _onItemMouseOut
         * @param e {Event} jQuery事件传入包装的event
         * @private
         */
        _onItemMouseOut: function(e){
            var target = $(e.currentTarget);
            target.removeClass(this.hoverClass);
        },
        /**
         * 数据项点击事件的操作
         * @method _onItemClick
         * @param e {Event} jQuery事件传入包装的event
         * @private
         */
        _onItemClick: function(e){
            var target = $(e.currentTarget);
            this.selectItem(target);
			//this.onSelect.call(this.node, this.lastSelectedValue);
			this.trigger('select',this.lastSelectedValue);
            this.finish();
			return false;
        },
        /**
         * node点击事件的操作
         * @method _onNodeKeyDown
         * @param e {Event} jQuery事件传入包装的event
         * @private
         */
        _onNodeKeyDown: function(e){
            this._lastKeyDown = e.keyCode;
            switch (this._lastKeyDown) {
                //pageup
                case 38:
                    this.active && this._prev();
                    break;
                //pagedown
                case 40:
                    if (this.active) {
                        this._next();
                    }
                    else {
                        this.activeAutoComplete();
                    }
                    break;
                //enter
                case 9:
                case 13:
                    this.active && this.selectCurrent();
                    break;
                //esc
                case 27:
                    this.active && this.finish();
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
        activeAutoComplete: function(){
        
            var self = this;
            
            if (this._activeTimeout) {
                clearTimeout(this._activeTimeout);
            }
            //如果是本地数据源
            if (this.delay && !this._localSource) {
            
                this._activeTimeout = setTimeout(function(){
                    self._activeNow();
                }, this.delay);
                
            }
            else {
            
                this._activeNow();
            }
            
        },
        /**
         * 判断输入的值是否符合激动自动提示的条件
         * @method _activeNow
         * @private
         */
        _activeNow: function(){
        
            var value = $.trim(this.node.val());
            //为空值
            if (!value.length) {
                this.finish();
                //最后一次访问的值
                this._lastProcessVal = null;
                return;
            }
            if (value != this._lastProcessVal) {
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
        _fetch: function(value){
            var currentData, self = this;
            //尝试读取缓存数据
            if (this._cacheData[value]) {
                this.set('currentData', this._cacheData[value]);
                return;
            }
            if (this._localSource) {
                if (this.source.length) {
                    currentData = this._filter(this.source, value);
                    self.parse(currentData);
                }
            }
            else {
            
                //发送请求,改变input状态
                this.node.addClass(this.loadingClass);
                //尝试远程获取数据
                if (typeof this.source === 'string') {
                
                    var postData = {}, name = this.node.attr('name');
                    postData[name] = value;
                    $.get(this.source).then(function(result){
                        self.parse(result);
                    });
                    
                }
                else 
                    if (typeof this.source === 'function') {
                    
                        this.source(value, function(result){
                            self.parse(result);
                        });
                        
                    }
                
            }
            
        },
        /**
         * 解析获取自动提示的数据
         * @method parse
         * @param result {Array} 获取的数据
         * @protected
         */
        parse: function(result){
            var currentData = this.getData(result),
				hasResult = this.getDataLength(currentData)
            
            if (hasResult) {
                this.active = true;
                
                this.set('currentData', currentData);
                
                this._setCacheData(this._lastProcessVal, currentData);
            }
            else {
            
                this.finish();
            }
            
            this.node.removeClass(this.loadingClass);
            
        },
        /**
         * 通过复写此函数得到需要的真实的数据
         * @method getData
         * @param result {Array} 获取的数据
         * @return result
         */
        getData: function(result){
            return result;
        },
		/**
         * 通过复写此函数得到数据的真实长度以便决定是否启用自动完成
         * @method getDataLength
         * @param result {Array} 获取的数据
         * @return result.length
         */
		getDataLength:function(result){
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
        _filter: function(data, value){
        
            var newArr = [];
            S.each(data, function(n, i){
                var reg = new RegExp(value, "gi");
                if (n.label) {
                    if (reg.test(n.label) || reg.test(n.value)) {
                        newArr.push(n);
                    }
                }
                else {
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
        finish: function(){
            this.active = false;
            this.currentIndex = null;
            this.hide();
        },
        
        /**
         * 此方法用来渲染当前的自动完成的数据
         * @method _setterCurrentData
         * @param currentData {Array} 获取的最后的数据
         * @return currentData
         * @private
         */
        _setterCurrentData: function(currentData){
        
            this.show();
            
            this.autoCompleteList.empty();
            
            if (typeof this.formatGroup === 'function') {
            
                this.autoCompleteList.append(this.formatGroup(this._lastProcessVal, currentData));
                
            }
            else {
            
                S.each(currentData, function(item, index){
                
                    if (typeof this.formatItem === 'function') {
                        this.autoCompleteList.append(this.formatItem(this._lastProcessVal, item, index));
                    }
                    else {
                        var label;
                        if (item.label) {
                            label = item.label.replace(new RegExp(this._lastProcessVal, 'g'), "<b class='orange'>" + this._lastProcessVal + "</b>");
                            
                        }
                        else {
                            label = item.replace(new RegExp(this._lastProcessVal, 'g'), "<b class='orange'>" + this._lastProcessVal + "</b>");
                        }
                        this.autoCompleteList.append('<div  class="simple-autocomplete-item" rel="autocompleteItem" data-value=' + this.getValue(item) + '>' + label + '</div>');
                    }
                    
                }, this);
            }
            
            this.setPosition(this.el, this.node, 'lt lb');
            
            
            
            return currentData;
            
        },
        /**
         * 此方法用来缓存远程获取的数据
         * @method _setCacheData
         * @param value {String} 自动提示的键值
         * @param data {Array} 远程获取的数据
         * @private
         */
        _setCacheData: function(value, data){
            if (this._cacheData.length && this._cacheData.length > 10) {
                this._cacheData = {};
                this._cacheData.length = 0;
            }
            this._cacheData[value] = data;
            this._cacheData.length++;
        },
        
        _next: function(){
        
            this.focus(1);
        },
        _prev: function(){
        
            this.focus(-1);
        },
        /**
         * 此方法用来聚焦选中的数据项
         * @method focus
         * @param index {Int} 索引值
         */
        focus: function(index){
        
            if (this.currentIndex == null || typeof this.currentIndex == 'undefined') {
                index = this.currentIndex = 0;
                
            }
            else {
            
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
        selectItem: function(index){
			var autoCompleteItem,val;
			if(index instanceof $){
				autoCompleteItem = index;
			}else{
				var items = $('[rel="autocompleteItem"]', this.el);
				index = index < 0 ? items.length - 1 : index;
				index = index == items.length ? 0 : index;
				this.currentIndex = index;
				items.removeClass("simple-autocomplete-selected");
				autoCompleteItem = items.eq(index);
				autoCompleteItem.addClass("simple-autocomplete-selected");
			}
            val = autoCompleteItem.attr('data-value');
            this.node.val(val);
            if (this.lastSelectedValue && this.lastSelectedValue != val) {
               // this.onChange.call(this.node, val);
                this.trigger('change',val);
            }
            this.lastSelectedValue = val;
        },
        /**
         * 获取每个数据项的值，复写此方法可以定制相关的自动完成功能
         * @method getValue
         * @param item {Item} 每条数据项
         * @return value
         */
        getValue: function(item){
            return item.value || item;
            
        },
        /**
         * 选中当前数据项
         * @method selectCurrent
         */
        selectCurrent: function(){
            this.selectItem(this.currentIndex);
            //this.onSelect.apply(this.node, [this.lastSelectedValue]);
            this.trigger('select',this.lastSelectedValue);
            this.finish();
        },
        /**
         * 销毁自动完成组件
         * @method destroy
         */
        destroy:function(){
            this.el.undelegate();
            this.currentIndex = null;
            this._cacheData = null;
            this.inherit(arguments);
        }
        
    });
    
    S.bridgeTojQuery('autocomplete', AutoComplete);
    
    return AutoComplete;
});
