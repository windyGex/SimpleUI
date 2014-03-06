define(function (require) {

    var declare = require('./declare'),
        S = require('./simple');


    //dojo/aspect

    var undefined, nextId = 0;
    function advise(dispatcher, type, advice, receiveArguments){
        var previous = dispatcher[type];
        var around = type == "around";
        var signal;
        if(around){
            var advised = advice(function(){
                return previous.advice(this, arguments);
            });
            signal = {
                remove: function(){
                    if(advised){
                        advised = dispatcher = advice = null;
                    }
                },
                advice: function(target, args){
                    return advised ?
                        advised.apply(target, args) :  // called the advised function
                        previous.advice(target, args); // cancelled, skip to next one
                }
            };
        }else{
            // create the remove handler
            signal = {
                remove: function(){
                    if(signal.advice){
                        var previous = signal.previous;
                        var next = signal.next;
                        if(!next && !previous){
                            delete dispatcher[type];
                        }else{
                            if(previous){
                                previous.next = next;
                            }else{
                                dispatcher[type] = next;
                            }
                            if(next){
                                next.previous = previous;
                            }
                        }

                        // remove the advice to signal that this signal has been removed
                        dispatcher = advice = signal.advice = null;
                    }
                },
                id: nextId++,
                advice: advice,
                receiveArguments: receiveArguments
            };
        }
        if(previous && !around){
            if(type == "after"){
                // add the listener to the end of the list
                // note that we had to change this loop a little bit to workaround a bizarre IE10 JIT bug
                while(previous.next && (previous = previous.next)){}
                previous.next = signal;
                signal.previous = previous;
            }else if(type == "before"){
                // add to beginning
                dispatcher[type] = signal;
                signal.next = previous;
                previous.previous = signal;
            }
        }else{
            // around or first one just replaces
            dispatcher[type] = signal;
        }
        return signal;
    }
    function aspect(type){
        return function(target, methodName, advice, receiveArguments){
            var existing = target[methodName], dispatcher;
            if(!existing || existing.target != target){
                // no dispatcher in place
                target[methodName] = dispatcher = function(){
                    var executionId = nextId;
                    // before advice
                    var args = arguments;
                    var before = dispatcher.before;
                    while(before){
                        args = before.advice.apply(this, args) || args;
                        before = before.next;
                    }
                    // around advice
                    if(dispatcher.around){
                        var results = dispatcher.around.advice(this, args);
                    }
                    // after advice
                    var after = dispatcher.after;
                    while(after && after.id < executionId){
                        if(after.receiveArguments){
                            var newResults = after.advice.apply(this, args);
                            // change the return value only if a new value was returned
                            results = newResults === undefined ? results : newResults;
                        }else{
                            results = after.advice.call(this, results, args);
                        }
                        after = after.next;
                    }
                    return results;
                };
                if(existing){
                    dispatcher.around = {advice: function(target, args){
                        return existing.apply(target, args);
                    }};
                }
                dispatcher.target = target;
            }
            var results = advise((dispatcher || existing), type, advice, receiveArguments);
            advice = null;
            return results;
        };
    }

    var Aspect = {
        before: aspect('before'),
        around: aspect('around'),
        after: aspect('after')
    };

    S.aspect = Aspect;

    var idCounter = 0,
        PREFIX = '_',
        PREFIX_REG_EXP = new RegExp('^' + PREFIX + '+'),
        EVENTS_SPLIT = '.';

    var uniqueId = function (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

    /**
     * 为SimpleUI提供基本的事件支持，简化事件操作流程，提升响应速度，
     * 并且针对SimpleUI的组件特性加入了对node节点的disabled嗅探
     *
     *  * 支持二级命名空间事件命名
     *  * 支持面向切面的事件编程,该类被设计为用于继承的基类。
     *
     * @module event
     * @class Simple.Event
     */
    var Event = declare('Event', {
        init: function () {
            this._events = {};
        },
        /**
         * 事件监听，绑定指定自定义事件名，在事件触发时执行相应的回调函数。可通过传入`all`来绑定所有自定义事件。
         *
         * @param  {String}   events   自定义事件名，多个用空格隔开
         * @param  {Function} callback 事件回调
         * @param  {Object}   context  事件作用域
         * @return {Object}            当前对象
         */
        on: function (events, callback, context) {
            var src, uid, evt, tail, name;

            this._events = this._events || {};
            events = events.split(/\s+/);

            while ((evt = events.shift())) {
                src = evt;
                evt = evt.split(EVENTS_SPLIT);
                if (typeof callback === 'function') {
                    uid = uniqueId(PREFIX);
                    tail = this._events;
                    while (typeof(name = evt.shift()) !== 'undefined') {
                        name = name.replace(PREFIX_REG_EXP, '');
                        if (name) {
                            tail[name] = tail[name] || {};
                            tail[name][uid] = {
                                _by: src,
                                fn: callback,
                                ctx: context || this
                            };
                            tail = tail[name];
                        } else {
                            continue;
                        }
                    }
                }
            }

            return this;
        },
        /**
         * 事件解绑／取消监听，移除一个或多个事件的监听。如果`context`为空。
         *
         * @param  {String}   events   自定义事件名，多个用空格隔开
         * @param  {Function} callback 事件回调
         */
        off: function (events, callback) {
            var evt, tail, name, src, k, last,
                offNames = {};
            if (!events) {
                this._events = {};
                return this;
            }
            this._events = this._events || {};
            events = events.split(/\s+/);
            while ((evt = events.shift())) {
                src = evt;
                evt = evt.split(EVENTS_SPLIT);
                tail = this._events;

                head = tail[evt.shift()];

                for (k in head) {
                    if (head.hasOwnProperty(k) && k.match(PREFIX_REG_EXP)) {
                        if (typeof callback === 'function') {
                            if (head[k].fn === callback && head[k]._by.indexOf(src) === 0) {
                                offNames[k] = head[k]._by.split(EVENTS_SPLIT);
                            }
                        } else {
                            if (head[k]._by.indexOf(src) === 0) {
                                offNames[k] = head[k]._by.split(EVENTS_SPLIT);
                            }
                        }
                    }
                }

                for (k in offNames) {
                    if (offNames.hasOwnProperty(k)) {
                        tail = this._events;
                        last = offNames[k].pop();
                        while ((name = offNames[k].shift())) {
                            if (tail[name]) {
                                delete tail[name][k];
                            }
                            tail = tail[name];
                        }
                        if (tail) {
                            delete tail[last];
                        }
                    }
                }
            }
            return this;
        },
        /**
         * 抛出一个或多个自定义事件，触发回调函数。
         * 通过`object.trigger(event, [*args])`的方式，追加的`args`可作为参数传递给`callback`。
         *
         * @param  {Object} events 自定义事件名，多个用空格隔开
         * @return {Object}        当前对象
         */
        trigger: function (events) {
            var args = [].slice.call(arguments, 1),
                type, evt, tail, name, k;

            this._events = this._events || {};
            events = events.split(/\s+/);
            while ((evt = events.shift())) {
                type = evt;
                evt = evt.split(EVENTS_SPLIT);
                tail = this._events;
                while (typeof(name = evt.shift()) !== 'undefined') {
                    tail = tail && tail[name];
                }

                for (k in tail) {

                    if (tail.hasOwnProperty(k) && k.match(PREFIX_REG_EXP)) {
                        return tail[k].fn.apply(tail[k].ctx, args.concat({
                            type: type,
                            currentType: tail[k]._by
                        }));
                    }
                }
            }

        },
        /**
         * 在一个方法之后执行callback
         * @param method
         * @param callback
         */
        after: function (method, callback) {
            return Aspect.after(this, method, callback);
        },
        /**
         * 在一个方法之前执行callback
         * @param method
         * @param callback
         */
        before: function (method, callback) {
            return Aspect.before(this, method, callback);
        },
        around: function (method, callback) {
            return Aspect.around(this, method, callback);
        }
    });

    return Event;
});






