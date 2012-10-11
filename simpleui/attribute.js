define(['simple', 'event', 'declare'], function(S, Event, declare){
    
    var methodToUpperCase = function(key){
        return key.charAt(0).toUpperCase() + key.substr(1);
    }, Attribute;
    
    /**
     * SimpleUI的属性类，该类被设计为用于混合的基类，用于为类的属性提供get，set支持。
     * 
     *     require(['attribute'],function(Attribute){
     *     
     *         var Animal = Simple.declare('Animal',Attribute,{
     *             
     *             _getterId:function(id){
     *                 if(id){
     *                     return id;
     *                 }else{
     *                     return 'animal';
     *                 }
     *             },
     *             
     *             _setterId:function(id){
     *             
     *                 return id+'_animal';
     *             }
     *         });
     *         
     *         var animal = new Animal();
     *         
     *         animal.get('id');//will console animal
     *         animal.id //will console undefined
     *         animal.set('id','test');//the id is test_animal
     *         
     *     });
     * 
     * @class Simple.Attribute
     * @extends Simple.EventTarget
     * @module attribute
     */
    Attribute = function(){
        Event.call(this);
    }
    S.mixin(Attribute.prototype, {
        /**
         * 获取某个key值，该值可以通过自定义的一个方法改变
         * 例如如果key为Name，那么复写getName方法可以改变取到的值
         * 	getterName:function(value){
         * 		return Math.min(value,0);
         * }
         * @method get
         * @param {String} key
         * @return {Object} 该key所对应的值
         */
        get: function(key){
            var method = '_getter' + methodToUpperCase(key);
            
            if (typeof this[method] === 'function') {
                return this[method](this[key]);
            }
            return this[key];
        },
        /**
         * 设置某个key的值，该值在改变前首先触发beforekeychange自定义事件
         * 其次该值可以通过定义的一个方法改变值
         * 最后如果设置成功，会触发keychange 事件
         * @method set
         * @param {Object} key
         * @param {Object} value
         */
        /**
         * 属性改变前的事件
         * @event before+Property+Change
         * @param {Object} value 需要设置的值
         */
        /**
         * 属性改变的事件
         * @event property+Change
         * @param {Object} value 需要设置的值
         */
        set: function(key, value){
            var oldValue = this[key], method = '_setter' + methodToUpperCase(key);
            
            if (this.trigger('before' + methodToUpperCase(key) + 'Change', value) ===
            false) {
                return false;
            }
            if (typeof this[method] === 'function') {
                this[key] = this[method](value);
            }
            else {
                this[key] = value;
            }
            if(oldValue !== value){
                this.trigger(key+ 'Change', value);
            }
        }
    });
    
    S.mixin(Attribute.prototype, Event.prototype);
    
    S.Attribute = Attribute;
    
    return Attribute;
});
