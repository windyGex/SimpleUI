/*!
 * SimpleUI javascript UI library
 * Copyright 2012, simpleui.org
 * Released under the MIT, BSD, and GPL Licenses.
 * More information: http://simpleui.org/
 * version : 2.0
 */
define(['jquery'], function ($) {
	if (typeof Simple == "undefined") {
		window.Simple = {};
	}
	var S = Simple;
	S.$ = $;
	S.isPlainObject = $.isPlainObject;
	S.isArray = $.isArray;
	S.uuid = 0;
	
	/**
	 * 拷贝一个对象到另外一个对象上，如果只有一个参数，那个这个对象的属性或者方法将被添加到Simple上。
	 * @param {Object} dest 源对象
	 * @param {Object} prop 拷贝的对象
	 * @return {Object} dest 修改后的dest对象
	 */
	S.mixin = function (dest, prop) {
		if (!prop) {
			prop = dest
				dest = S;
		}
		for (var key in prop) {
			
			dest[key] = prop[key];
			
		}
		return dest;
	};
	/**
	 * 拷贝一个对象到另外一个对象上，不会覆盖冲突属性
	 * @param {Object} dest 源对象
	 * @param {Object} prop 拷贝的对象
	 * @return {Object} dest 修改后的dest对象
	 */
	S.mixinIf = function (dest, prop) {
		if (!prop) {
			prop = dest
				dest = S;
		}
		for (var key in prop) {
			if (!dest[key]) {
				dest[key] = prop[key];
			}
		}
		return dest;
	};
	S.mixin({
		/**
		 * 设置一个类为另外一个类的子类，可以使用instanceof判断之间的关系
		 * @param {object} subCls 用于继承的子类
		 * @param {object} superCls 被继承的父类
		 * @return {object} subCls 返回子类
		 */
		extend : function (subCls, superCls) {
			var F = function () {},
			subClsProp;
			F.prototype = superCls.prototype;
			subClsProp = subCls.prototype = new F();
			subCls.prototype.constructor = subCls;
			subCls.superclass = superCls.prototype;
			return subCls;
		},
		
		/**
		 * 遍历一个数组或者对象，并执行回调函数
		 * @param {Object | Array} object 被遍历的对象
		 * @param {Function} callback 执行的回调函数
		 * @param {Object} conext 回调函数内部的作用域
		 * @return {Object} object 被遍历的对象
		 */
		each : function (object, callback, context) {
			var name,
			i = 0,
			length = object.length;
			if (length === undefined) {
				for (name in object) {
					if (callback.call(context || object[name], object[name], name) === false) {
						break;
					}
				}
			} else {
				for (var value = object[0]; i < length && callback.call(context || object[name], value, i) !== false; value = object[++i]) {}
			}
			return object;
		},
		/**
		 * 声明一个命名空间
		 *  
		 *  Simple.namespace("Simple.dd");
		 *  Simple.dd.Drag=function(){}
		 *  
		 * @param {string} arguments
		 * @return {object} o 根据给出的字符串创建的对象
		 */
		namespace : function () {
			var a = arguments,
			o = this,
			i = 0,
			j,
			d,
			arg;
			for (; i < a.length; i++) {
				arg = a[i];
				if (arg.indexOf(".")) {
					d = arg.split(".");
					for (j = (d[0] == 'Simple') ? 1 : 0; j < d.length; j++) {
						o[d[j]] = o[d[j]] || {};
						o = o[d[j]];
					}
				} else {
					o[arg] = o[arg] || {};
				}
			}
			return o;
		},
		/**
		 * 在控制台输出信息
		 * @param {string} msg 需要输出的内容
		 */
		log : function (msg) {
			if (window.console && console.log) {
				console.log.call(this, msg);
			}
		},
		/**
		 * 替换字符串的辅助函数
		 * @param {Object} template
		 * @param {Object} map
		 * @param {Object} beforeReplace
		 * @return 替换后的字符串
		 */
		replace : function (template, map, beforeReplace) {
			return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key) {
				var value = map[key];
				return beforeReplace(value, key).toString();
			});
		},
		/**
		 * 获取当前页面的可视宽高
		 * @param el {Object} 需要后去宽高的HTML对象
		 * @param isDoc {Boolean} 是否获取整个高度(加上滚动条部分)
		 * @return {Object} Object.h 高度
		 * @return {Object} Object.w 宽度
		 */
		getSize : function (el, isDoc) {
			if (!(el instanceof jQuery)) {
				el = $(el);
			}
			if (el.is('body')) {
				if (isDoc) {
					return this.getDoc();
				} else {
					return this.getClient();
				}
			} else {
				return {
					h : el.outerHeight(),
					w : el.outerWidth()
				}
			}
		},
		getRegion : function (el) {
			return S.mixin(el.offset(), {
				'right' : el.offset().left + el.width(),
				'bottom' : el.offset().top + el.height(),
				'width' : el.width(),
				'height' : el.height()
			});
		},
		getScrollTop : function () {
			return document.documentElement.scrollTop || document.body.scrollTop;
		},
		
		getScrollLeft : function () {
			return document.documentElement.scrollLeft || document.body.scrollLeft;
		},
		/**
		 * 获取当前页面的宽高(加上滚动条部分)
		 * @return {Object} Object.h 高度
		 * @return {Object} Object.w 宽度
		 */
		getDoc : function () {
			return {
				h : Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight),
				w : Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth)
			}
		},
		/**
		 * 获取当前页面的可视宽高
		 * @return {Object} Object.h 高度
		 * @return {Object} Object.w 宽度
		 */
		getClient : function () {
			return {
				h : document.documentElement.clientHeight,
				w : document.documentElement.clientWidth
			}
		},
		/**
		 * 将Simple下的插件桥接到jQuery
		 * @param methodName {String} 插件名称
		 * @param widget {Object} 对应的插件
		 */
		bridgeTojQuery : function (methodName, widget) {
			var methodArray = methodName.split(",");
			$.each(methodArray, function (i, n) {
				$.fn[n] = function (config) {
					return this.each(function () {
						if (config == "destroy") {
							if (jQuery.data(this, "widget-" + n)) {
								jQuery.data(this, "widget-" + n).destroy();
								$(this).removeData("widget-" + n);
								return;
							} else {
								return true;
							}
						}
						config = config || {};
						config = S.mixin(config, {
								node : this
							});
						//不要重复绑定
						if ($.data(this, "widget-" + n)) {
							return;
						}
						var widgetInc = new widget(config);
						$.data(this, "widget-" + n, widgetInc);
					});
				}
			});
		}
	});
	
	S.mixin({
		isFitHorizontal : function (el, leftOffset) {
			var leftVal = parseInt(leftOffset) || $(el).offset().left,
			scrollLeft = this.getScrollLeft(),
			bodyWidth = this.getClient().w;
			elWidth = $(el).width();
			return (leftVal + elWidth <= bodyWidth + scrollLeft && leftVal - scrollLeft >= 0);
		},
		isFitVertical : function (el, topOffset) {
			var topVal = parseInt(topOffset) || $(el).offset().top;
			scrollTop = this.getScrollTop(),
			bodyHeight = this.getClient().h,
			elHeight = $(el).height();
			return (topVal + elHeight <= bodyHeight + scrollTop && topVal - scrollTop >= 0);
		},
		
		position : (function () {
			
			return {
				/**
				 * 设置某个对象相对参考对象的位置
				 * @param config {Object}
				 * @param config.node {Object} 需要设置位置的对象
				 * @param config.context {Object} 相对对象
				 * @param config.position {String} 可选参数("cc cc")
				 * @param config.offset {String|Function} '0,5'
				 */
				at : function (config) {
					
					var setPosition = function () {
						
						var node = $(config.node),
						referNode = $(config.context),
						nodeOffset,
						referNodeOffset,
						nodeWidth = node.outerWidth(),
						nodeHeight = node.outerHeight(),
						referNodeWidth = referNode.outerWidth(),
						referNodeHeight = referNode.outerHeight(),
						points = config.position || 'cc cc',
						t = 0,
						l = 0,
						offset = config.offset || '0 0';
						if (referNode.is('body')) {
							var size = S.getSize(document.body);
							referNodeWidth = size.w;
							referNodeHeight = size.h;
						}
						
						if (node.css('position') === 'static') {
							node.css('position', 'absolute');
						}
						
						nodeOffset = node.offset();
						referNodeOffset = referNode.offset();
						
						if (typeof points === 'string') {
							switch (points) {
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
						
						if (typeof offset === 'function') {
							offset = offset();
						}
						
						offset = offset.split(' ');
						
						l = l + parseInt(offset[0]);
						t = t + parseInt(offset[1]);
						
						node.css({
							top : t,
							left : l
						});
						
					}
					
					setPosition();
					$(window).resize(setPosition);
					
				},
				/**
				 * 让某个元素 相对body局中
				 * @param node {Object} 需要获取位置的对象
				 */
				atBody : function (node) {
					var node = $(node),
					pos = node.css("position"),
					doc = S.getSize(document.body);
					if (pos == "fixed") {
						node.css({
							top : (doc.h - node.height()) / 2,
							left : (doc.w - node.width()) / 2
						});
					} else
						if (pos == "absolute") {
							node.css({
								top : (doc.h - node.height()) / 2 + Math.max(document.documentElement.scrollTop, document.body.scrollTop),
								left : (doc.w - node.width()) / 2
							});
						}
				}
			}
		})()
		
	});
	return S;
});
