define(function (require) {
	var $ = require('jquery'),
	declare = require('./declare'),
	Events = require('./events'),
    DataSchema = require('./data-schema');

	var arrayPromise = function (result) {
		if (!result) {
			return;
		}
		var propMethods = ['forEach', 'map', 'filter'];
		$.each(propMethods, function (index, method) {
			if (!result[method]) {
				result[method] = function () {
					var args = arguments;
					//存储遍历的函数
					return $.when(result).then(function (data) {
						Array.prototype.unshift.call(args, data || []);
						return arrayPromise(arrayUtils[method].apply(this, args));
					});
				};
			}
		});
		if (!result.then) {
			result = $.extend(result, $.when(result).then(function (result) {
						return result;
					}));
		}
		return result;
	};

	var arrayUtils = {
		forEach : function (data, callback) {
			for (var i = 0; i < data.length; i++) {
				if (callback.call(data[i], data[i], i) === false) {
					break;
				}
			}
		},
		map : function (data, callback) {
			for (var i = 0; i < data.length; i++) {
				var item = callback.call(data[i], data[i], i);
				data[i] = item;
			}
			return data;
		},
		filter : function (data, callback) {
			var filterData = [];
			arrayUtils.forEach(data, function (item) {
				if (callback(item)) {
					filterData.push(item);
				}
			});
			return filterData;
		}
	};
	/**
	 * 静态数据源，用于数据的查询，过滤，排序，分页等
	 * @class Simple.JsonStore
	 * @module json-store
	 */
	var JsonStore = declare('JsonStore', [Events, DataSchema], {

			name : 'JsonStore',

            data : {},

            index: 'id',

			init : function () {
                this.schemaData = this.schemaFilter(this.data);
                this.data = this.schemaData.list;
				this._afterDataChange(this.data);
			},
			queryEngine : function (data, options) {
				var filterData,
				//排序参数
				sortSet = options.sort;
				//先通过条件过滤
				filterData = this._filter(data, options);
				if (sortSet) {
					if (typeof sortSet == 'function') {
						filterData.sort(sortSet);
					} else {
						if ($.isPlainObject(sortSet)) {
							sortSet = [sortSet];
						}
						for (var i = 0; i < sortSet.length; i++) {
							filterData.sort(function (a, b) {
								var aValue = a[sortSet[i].attr],
								bValue = b[sortSet[i].attr];
								return sortSet[i].sortBy == 'desc' ? (aValue < bValue) : (aValue > bValue);
							});
						}
					}
				}

				//分页
				if (options.start && options.limit) {
					filterData = filterData.slice(options.start, options.limit);
				}
				return filterData;
			},
			_filter : function (data, options) {
				var query = options.query,
				packageQuery = query;
				//all data
				if (!query) {
					return data;
				}

				if (typeof query === 'string') {
					packageQuery = this[query];
				} else if ($.isPlainObject(query)) {
					packageQuery = function (value, index) {
						for (var key in query) {
							var condition;
							if (options.strict === false) {
								condition = (value[key].indexOf(query[key]) == -1);

							} else {
								condition = (query[key] != value[key]);
							}
							if (condition) {
								return false;
							}
						}
						return true;
					};
				}
				return arrayUtils.filter(data, packageQuery);
			},
			/**
			 * 增加一条数据
			 * @param object
			 * @param options
			 * @returns {*}
			 */
			add : function (object, options) {
				options = options || {};
				options.override = false;
				return this.put(object, options);
			},
			/**
			 * 根据id获取一条数据
			 * @param id
			 * @returns {Object}
			 */
			get : function (id) {
				return id && this.data[this._dataHash[id]];
			},
			/**
			 * 修改一条数据
			 * @param object
			 * @param options
			 * @returns {*|number}
			 */
			put : function (object, options) {
				options = options || {};
				var id = options[this.index] || object[this.index] || Math.random();
				//判断是否存在此索引
				if (id in this._dataHash) {
					//add 操作
					if (options.override === false) {
						this.trigger('error', object);
					} else {
						//替换data
						this.data[this._dataHash[id]] = object;
					}
				} else {
					this._dataHash[id] = this.data.push(object) - 1;
				}
				if (!options.disableEvent) {
					if (options.override === false) {
						this.trigger('add', object);
					} else {
						this.trigger('put', object);
					}
				}

				return id;
			},
			/**
			 * 根据id删除一条数据
			 * @param id
			 * @param options
			 */
			remove : function (id, options) {
				options = options || {};
				if (id in this._dataHash) {
					this.data.splice(this._dataHash[id], 1);
					this._afterDataChange(this.data);
					if (!options.disableEvent) {
						this.trigger('remove', this.get(id));
					}
				}
			},
			/**
			 * 查询数据
			 * @param query
			 * @param options
			 * @returns {Array}
			 */
			find : function (query, options) {
				var result = [];
				options = options || {};

				options.query = query;
				result = this.queryEngine(this.data, options);

				arrayPromise(result);
				if (!options.disableEvent) {
					this.trigger('change', result);
				}

				return result;
			},
			/**
			 * 获取所有数据
			 * @returns {Array}
			 */
			findAll : function () {
				return arrayPromise(this.data);
			},
			_afterDataChange : function (data) {
				var dataHash = {};
				for (var i = 0; i < data.length; i++) {
					dataHash[data[i][this.index]] = i;
				}
				this._dataHash = dataHash;
			}
		});

	return JsonStore;

});
