define(['simple', 'declare'], function(S, declare){
    var aspect = (function(){
        var nextId = 0;
        function advise(dispatcher, type, advice, receiveArguments){
            var previous = dispatcher[type];
            var around = type == "around";
            var signal;
            if (around) {
                var advised = advice(function(){
                    return previous.advice(this, arguments);
                });
                signal = {
                    remove: function(){
                        signal.cancelled = true;
                    },
                    advice: function(target, args){
                        return signal.cancelled ? previous.advice(target, args) : advised.apply(target, args);
                    }
                };
            }
            else {
                // create the remove handler
                signal = {
                    remove: function(){
                        var previous = signal.previous;
                        var next = signal.next;
                        if (!next && !previous) {
                            delete dispatcher[type];
                        }
                        else {
                            if (previous) {
                                previous.next = next;
                            }
                            else {
                                dispatcher[type] = next;
                            }
                            if (next) {
                                next.previous = previous;
                            }
                        }
                    },
                    id: nextId++,
                    advice: advice,
                    receiveArguments: receiveArguments
                };
            }
            if (previous && !around) {
                if (type == "after") {
                    // add the listener to the end of the list
                    var next = previous;
                    while (next) {
                        previous = next;
                        next = next.next;
                    }
                    previous.next = signal;
                    signal.previous = previous;
                }
                else 
                    if (type == "before") {
                        // add to beginning
                        dispatcher[type] = signal;
                        signal.next = previous;
                        previous.previous = signal;
                    }
            }
            else {
                // around or first one just replaces
                dispatcher[type] = signal;
            }
            return signal;
        }
        
        function aspect(type){
            return function(target, methodName, advice, receiveArguments){
                var existing = target[methodName], dispatcher;
                if (!existing || existing.target != target) {
                    // no dispatcher in place
                    target[methodName] = dispatcher = function(){
                        var executionId = nextId;
                        // before advice
                        var args = arguments;
                        var before = dispatcher.before;
                        while (before) {
                            args = before.advice.apply(this, args) || args;
                            before = before.next;
                        }
                        // around advice
                        if (dispatcher.around) {
                            var results = dispatcher.around.advice(this, args);
                        }
                        // after advice
                        var after = dispatcher.after;
                        while (after && after.id < executionId) {
                            results = after.receiveArguments ? after.advice.apply(this, args) || results : after.advice.call(this, results);
                            after = after.next;
                        }
                        return results;
                    };
                    if (existing) {
                        dispatcher.around = {
                            advice: function(target, args){
                                return existing.apply(target, args);
                            }
                        };
                    }
                    dispatcher.target = target;
                }
                var results = advise((dispatcher || existing), type, advice, receiveArguments);
                advice = null;
                return results;
            };
        }
        return {
            before: aspect("before"),
            around: aspect("around"),
            after: aspect("after")
        };
    })();
    
    S.aspect = aspect;
    /**
     * 为SimpleUI提供基本的事件支持，简化事件操作流程，提升响应速度，
     * 并且针对SimpleUI的组件特性加入了对node节点的disabled嗅探
     *
     *  * 当该节点的的样式类中包含`disable`，则不会对该操作进行响应
     *  * 支持二级命名空间事件命名
     *  * 支持面向切面的事件编程,该类被设计为用于继承的基类。
     *
     * @module event
     * @class Simple.EventTarget
     */
    var Event = declare('EventTarget', {
        /**
		 * 自定义事件
		 *     
		 *     listeners:{
		 *         change:$.noop
		 *     }
		 *     
		 *     this.trigger('change');
		 *     
		 * @type Object
		 * @property listeners
		 * @default null
		 */
		listeners:null,
        init: function(){
            this._events = {};
            //add customize event support
			if(this.listeners){
				S.each(this.listeners,function(callback,event){
					this.on(event,callback);
				},this);
			}
        },
        /**
         * 绑定一个事件，并且返回一个对象用于解绑该事件
         *
         *     var eventBinder = event.on('test',callback);
         *     eventBinder.off();
         *
         * @method on
         * @param  {String} type  事件的名称
         * @param  {Function} handle 该事件的回调函数
         * @return {Object} 用于对这个事件进行解绑操作
         */
        on: function(type, handle){
        
            var index, self = this, events = type.split('/'), eventPrefix, eventType, namespace, eventQueue;
            if (events.length > 1) {
                eventPrefix = events[0];
                eventType = events[1];
            }
            else {
                eventType = events[0];
            }
            
            if (eventPrefix) {
            
                if (!this._events[eventPrefix]) {
                    namespace = this._events[eventPrefix] = {};
                }
                if (!this._events[eventPrefix]._meta) {
                    this._events[eventPrefix]._meta = [];
                }
                if (!this._events[eventPrefix][eventType]) {
                
                    eventQueue = this._events[eventPrefix][eventType] = [];
                    this._events[eventPrefix]._meta.push(handle);
                }
            }
            else {
                if (!this._events[eventType]) {
                    eventQueue = this._events[eventType] = [];
                }
                else {
                    eventQueue = this._events[eventType];
                }
            }
            
            index = eventQueue.push(handle);
            
            return {
                off: function(){
                    eventQueue.splice(index, 1);
                }
            }
            
        },
        /**
         * 解除事件的绑定
         *
         *     var eventBinder = event.on('test',callback);
         *     event.off('test',callback)
         *
         * @method off
         * @param  {String} type  事件的名称
         * @param  {Function} handle 该事件的回调函数
         * @return {Boolean} 解绑成功返回true
         */
        off: function(type, handle){
            if (!type) {
                this._events = {};
                return true;
            }
            var index, events = type.split('/'), eventPrefix, eventType, eventQueue;
            
            if (events.length > 1) {
                eventPrefix = events[0], eventType = events[1];
            }
            else {
                eventType = events[0];
            }
            
            if (eventPrefix) {
                if (!this._events[eventPrefix]) {
                    return true;
                }
                else {
                    if (!this._events[eventPrefix][eventType]) {
                        return true;
                    }
                    else {
                        eventQueue = this._events[eventPrefix][eventType];
                    }
                }
            }
            else {
                if (!this._events[eventType]) {
                    return true;
                }
                else {
                    eventQueue = this._events[eventType];
                }
            }
            
            for (var i = 0; i < eventQueue.length; i++) {
                if (eventQueue[i] === handle) {
                    eventQueue.splice(i, 1);
                    break;
                }
            }
            
            return true;
            
        },
        /**
         * 触发一个事件，可以使用该事件的命名空间来触发一组事件
         *
         *     var eventBinder = event.on('test',callback);
         *     event.trigger('test');
         *
         * @method trigger
         * @param  {String} type  事件的名称
         * @param  {Object} args 传入该事件回调的参数
         * @return {Boolean} 返回true
         */
        trigger: function(type, args){
        
            var index, events = type.split('/'), eventPrefix, eventType, eventQueue = [], eventResult = true;
            
            if (args && args.node && /disable/.test(args.node.attr('class'))) {
                return false;
            }
            
            if (events.length > 1) {
                eventPrefix = events[0], eventType = events[1];
            }
            else {
                eventType = events[0];
            }
            
            if (eventPrefix) {
                if (!this._events[eventPrefix]) {
                    return true;
                }
                eventQueue = this._events[eventPrefix][eventType] || [];
            }
            else {
                if (this._events[eventType]) {
                    if (this._events[eventType].length) {
                        eventQueue = this._events[eventType];
                    }
                    else {
                        if (this._events[eventType]._meta) {
                            eventQueue = this._events[eventType]._meta;
                        }
                    }
                }
                else {
                    return;
                }
            }
            
            for (var i = 0; i < eventQueue.length; i++) {
                if (eventQueue[i].call(this, args) === false) {
                    eventResult = false;
                    break;
                };
                            }
            
            return eventResult;
        },
        /**
         * 过滤一个方法，返回一个新的方法
         * @method aspect
         * @param  {Function} method 在过滤这个方法的时候需要执行的方法
         * @return {Object} 返回通知的类型方法
         */
        aspect: function(method){
            var self = this;
            return {
                before: function(advice, args){
                    return aspect.before(self, method, advice, args)
                },
                after: function(advice, args){
                    return aspect.after(self, method, advice, args)
                },
                around: function(advice, args){
                    return aspect.around(self, method, advice, args)
                }
            }
        }
    });
    
    return Event;
});





