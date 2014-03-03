/**
 * @module attribute
 */
define(function (require) {

    var Event = require('./events'),
        declare = require('./declare'),
        $ = require('jquery');

    var methodToUpperCase = function (key) {
        return key.charAt(0).toUpperCase() + key.substr(1);
    };


    /**
     * SimpleUI的属性类，该类被设计为用于混合的基类，用于为类的属性提供get，set支持。
     * @class Simple.Attribute
     * @extends Simple.Event
     */
    return  declare('Attribute', Event, {
        /**
         * 获取某个key值，该值可以通过自定义的一个方法改变
         * 例如如果key为Name，那么复写getName方法可以改变取到的值
         *    _getterName:function(value){
         * 		return Math.min(value,0);
         * }
         * @method get
         * @param {String} key
         * @return {Object} 该key所对应的值
         */
        get: function (key) {
            var method = '_getter' + methodToUpperCase(key);

            if (typeof this[method] === 'function') {
                return this[method](this[key]);
            }
            return this[key];
        },
        /**
         * 设置某个key的值
         * 其次该值可以通过定义的一个方法改变值
         * 最后如果设置成功，会触发keyChange 事件
         * @method set
         * @param {String} key
         * @param {Object} value
         * @param {Object} options
         * @return this
         */
        set: function (key, value, options) {

            if (typeof key === 'object') {
                $.each(key, function (name,value) {
                    this.set(name, key[name], options);
                }.bind(this));
                return this;
            }

            var method = '_setter' + methodToUpperCase(key),
                args = Array.prototype.slice.call(arguments, 1),
                result,
                options = options || {},
                oldValue = this.get(key),
                promise = function(){
                    var newValue = this.get(key);
                    if (options.forceEvent || (oldValue !== newValue && !options.disableEvent)) {
                        this.trigger('attrchange', key, newValue, oldValue);
                        this.trigger(key+'Change', newValue, oldValue);
                    }
                }.bind(this);


            if (typeof this[method] === 'function') {
                result = this[method].apply(this, args);
            } else {
                this[key] = value;
            }
            if(result){
                $.when(result,promise);
            }else{
                promise();
            }
            return this;
        },

        _bindAttrChange: function(){
            this.on('attrchange',function(key, newValue, oldValue){
                var attrchangeMethod = this['_uiSet'+methodToUpperCase(key)];
                if(typeof attrchangeMethod == 'function'){
                    attrchangeMethod.apply(this, [newValue, oldValue]);
                }
            });
        }
    });
});
