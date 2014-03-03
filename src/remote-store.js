define(function (require) {
    var $ = require('jquery'),
        Events = require('./events'),
        declare = require('./declare'),
        JsonStore = require('./json-store'),
        DataSchema = require('./data-schema'),
        queryEngine = function(url,config){
            return $.ajax($.extend({
                url:url
            },config));
        };

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
        forEach: function (data, callback) {
            for (var i = 0; i < data.length; i++) {
                if (callback.call(data[i], data[i], i) === false) {
                    break;
                }
            }
        },
        map: function (data, callback) {
            for (var i = 0; i < data.length; i++) {
                var item = callback.call(data[i], data[i], i);
                data[i] = item;
            }
            return data;
        },
        filter: function (data, callback) {
            var filterData = [];
            arrayUtils.forEach(data, function (item) {
                if (callback(item)) {
                    filterData.push(item);
                }
            });
            return filterData;
        }
    };

    var RemoteStore = declare('RemoteStore',[Events,DataSchema],{


        queryEngine: queryEngine,

        target:'',

        index:'',


        init: function (config) {
            this._cacheParams = {};
        },

        add: function (object, options) {
            options = options || {};
            options.override = false;
            return this.put(object, options);
        },
        put: function (object, options) {
            options = $.extend({}, options, object);
            var self = this;
            return this.queryEngine(this.target, options).then(function (data) {
                if (self.isLoad) {
                    //以后端返回的数据为准
                    data = data || object;
                    options.disableEvent = true;
                    self.queryResult.put(object, options);
                }
                if (options.override === false) {
                    self.trigger('add', object);
                } else {
                    self.trigger('put', object);
                }
                return data;
            });
        },
        get: function (id, options) {
            var query = {};
            query[this.index] = id;
            if (options.cache && this.queryResult) {
                return this.queryResult.get(id);
            } else {
                options = options || {};
                return this.find(query, $.extend(options, {
                        disableEvent: true
                    })).then(function (data) {
                        return data[0];
                    });
            }
        },
        post: function (options) {
            return this.queryEngine(this.target, options);
        },

        find: function (query, options) {
            var self = this, config;
            options = options || {};
            if (options.cache && this.isLoad) {
                return this.queryResult.find(query, options);
            } else {
                if (options.override) {
                    config = $.extend({}, query, options);
                    delete config.override;
                } else {
                    config = $.extend({}, this._cacheParams, query, options);
                }
                this._cacheParams = config;
                var result = this.queryEngine(this.target, config);
                arrayPromise(result);
                result.done(function (data) {
                    data = data || {};
                    self.schemaData = self.schemaFilter(data);
                    self.data = self.schemaData.list;
                    //需要缓存
                    if (!options.disableCache) {
                        self.queryResult = new JsonStore({
                            index: self.index,
                            data: self.schemaData.list || []
                        });
                        self.isLoad = true;
                    }
                    if (!options.disableEvent) {
                        self.trigger('change', self.schemaData);
                    }
                    return data;
                });
                return result;
            }
        },

        remove: function (id, options) {
            options = options || {};
            options[this.index] = id;
            var self = this;
            return this.queryEngine(this.target, options).then(function (data) {
                if (self.isLoad) {
                    options.disableEvent = true;
                    if ($.isArray(id)) {
                        $.each(id, function (index, id) {
                            self.queryResult.remove(id, options);
                        });
                    } else {
                        self.queryResult.remove(id, options);
                    }
                }
                self.trigger('remove', data);
                return data;
            });
        },

        clear: function () {
            this.queryResult = null;
            this.isLoad = false;
        }
    });

    return RemoteStore;

});