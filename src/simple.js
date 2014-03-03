define(function (require) {

	var $ = require('jquery');
	require('../lib/es5-shim');

	if (typeof Simple === 'undefined') {
		window.Simple = {};
	}

	$.extend(Simple, {

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
		extend : function (subCls, superCls) {
			var F = function () {},
			subClsProp;
			F.prototype = superCls.prototype;
			subClsProp = subCls.prototype = new F();
			subCls.prototype.constructor = subCls;
			subCls.superclass = superCls.prototype;
			return subCls;
		},
		assert : function (condition, message) {
			if (condition) {
				throw new Error(message);
			}
		},
		/**
		 * 获取元素的 left top right bottom
		 *
		 * @method getCoordinates
		 * @param {Object} element 需要获取位置的对象
		 * @return {Object} 返回对象的left top right bottom值
		 */
		getCoordinates : function (element) {
			var coor;
			element = $(element);
			if (element.length < 1) {
				return {};
			}
			var offset = element.offset(),
			right = element.outerWidth() + offset.left,
			bottom = element.outerHeight() + offset.top;

			coor = $.extend({
					right : right,
					bottom : bottom
				}, offset);

			return coor;
		},
		/**
		 * 获取元素的包含边框的width height值
		 *
		 * @method getOuterDimensions
		 * @param {Object} element 需要获取位置的对象
		 * @return {Object} 返回对象包含边框的width height值
		 */
		getOuterDimensions : function (element) {

			element = $(element);

			if (element.is('body')) {
				return this.getClient();
			}
			return {
				width : element.outerWidth(),
				height : element.outerHeight()
			};
		},
		/**
		 * 获取当前视窗的滚动位置
		 *
		 * @method getScroll
		 * @return {Object} 返回对象的left top
		 */
		getScroll : function () {
			return {
				left : Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),
				top : Math.max(document.documentElement.scrollTop, document.body.scrollTop)
			}
		},
		/**
		 * 获取当前页面的宽高(加上滚动条部分)
		 * @return {Object} Object.h 高度
		 * @return {Object} Object.w 宽度
		 */
		getDoc : function () {
			return {
				width : Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight),
				height : Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth)
			}
		},
		/**
		 * 获取当前页面的可视宽高
		 * @return {Object} Object.h 高度
		 * @return {Object} Object.w 宽度
		 */
		getClient : function () {
			return {
				height : document.documentElement.clientHeight,
				width : document.documentElement.clientWidth
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
			return template.replace(/\{\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}\}/g, function (match, key) {
				var value = map[key];
				return beforeReplace(value, key).toString();
			});
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
							if ($.data(this, "widget-" + n)) {
								$.data(this, "widget-" + n).destroy();
								$(this).removeData("widget-" + n);
								return;
							} else {
								return true;
							}
						}
						config = config || {};
						config = $.extend(config, {
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

	return Simple;

});
