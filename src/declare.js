/**
 * @module declare
 */
define(function (require) {

	var $ = require('jquery'),
	S = require('./simple'),
	getUniqueArray = function (arr) {
		var _metaBase = {},
		_tempBase = [];
		$.each(arr, function (index, item) {
			if (!_metaBase[item]) {
				_tempBase.push(item);
				_metaBase[item] = item;
			}
		});
		_metaBase = null;
		return _tempBase;
	},
	_crackName = function (name) {
		var index = name.lastIndexOf("."),
		clsName,
		o,
		args;
		if (index != -1) {
			args = name.substring(0, index);
			o = S.namespace(args);
			clsName = name.substring(index + 1, name.length);
		} else {
			clsName = name;
			o = S;
		}
		return {
			clsName : clsName,
			namespace : o
		};
	};

	/**
	 * 定义一个基础类，并且遍历指定的对象，拷贝到类的原型链上，并且调用原型链上的init的方法进行初始化。
	 * 如果指定父类，则该类会继承于这个父类，并且可以使用inherit来便捷调用父级方法.
	 *
	 *     var Animal = declare({
	 *         getName:function(){
	 *             return 'animal';
	 *         }
	 *     });
	 *     var Bird = declare(Animal,{
	 *         getName:function(){
	 *             var superResult = this.inherit(arguments);
	 *             return superResult + ' bird';
	 *         }
	 *     });
	 *     console.log(new Bird().getName());//will console animal bird
	 *
	 * @method declare
	 * @static
	 * @param {String} name 定义构造函数的名字
	 * @param {Array | Function} superCls 定义构造函数需要继承的父类
	 * @param {Object} props 定义构造函数的原型链属性
	 * @return 定义后的构造函数
	 */
	var declare = function (name, superCls, props) {

		var args = arguments,
		clsInfo;

		S.assert(args.length < 1, '请至少指定一个变量作为[declare]接收的参数！');

		if (args.length == 1) {
			props = name;
			superCls = null;
			name = null;
		} else if (args.length == 2) {
			if (typeof name === 'string') {
				props = superCls;
				superCls = null;
			} else {
				props = superCls;
				superCls = name;
				name = null;
			}
		}
		//生成构造函数
		var subCls = function (config) {
			$.extend(this, config);
			var base = subCls._meta.base;
			if (base.length) {
				for (var i = base.length - 1; i >= 0; i--) {
					base[i].apply(this, arguments);
				}
			}
		};

		if (name) {
			clsInfo = _crackName(name);
			//生成构造函数
			clsInfo.namespace[clsInfo.clsName] = subCls;
		}

		subCls._meta = {
			base : [props.init ||
				function () {}

			],
			parents : [],
			superclass : {}
		};

		if (superCls) {
			if (!(superCls instanceof Array)) {
				superCls = [superCls];
			}
			//继承第一个父类
			S.extend(subCls, superCls[0]);
			//按照逆序序拷贝聚合类的构造函数
			for (var i = superCls.length - 1; i >= 0; i--) {
				if (superCls[i]._meta.base.length) {
					$.each(superCls[i]._meta.base, function (index, item) {
						subCls._meta.base.push(item);
					});
				}
				subCls._meta.parents.push(superCls[i].prototype.init);
			}
			//将base类去重处理
			subCls._meta.base = getUniqueArray(subCls._meta.base);

			////按照顺序拷贝聚合类的原型链
			for (var i = 0; i < superCls.length; i++) {
				$.extend(subCls._meta.superclass, superCls[i].prototype);
				$.extend(subCls.prototype, superCls[i].prototype);
			}
		}

		$.each(props, function (prop, value) {
			//sepical object handle
			if (prop === 'events') {
				subCls.prototype.events = $.extend(true, {}, subCls.prototype.events, value);
			} else {
				subCls.prototype[prop] = value;
			}
			if (typeof value === 'function') {

				subCls.prototype[prop] = (function () {
					var inherit = function () {
						return superCls[0].prototype[prop].apply(this, arguments);
					},
					inheritApply = function (args) {
						return superCls[0].prototype[prop].apply(this, args);
					};
					return function () {
						var _inherit = this.inherit,
						_inheritApply = this.inheritApply,
						returnValue;
						this.inherit = inherit;
						this.inheritApply = inheritApply;
						returnValue = value.apply(this, arguments);
						this.inherit = _inherit;
						this.inheritApply = _inheritApply;
						return returnValue;
					};
				})();
			}
		});
		subCls.prototype.constructor = subCls;
		return subCls;
	};

	S.declare = declare;

	return declare;
});
