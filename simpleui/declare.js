
define(['simple'], function(S){
    //declare
    var _crackName = function(name){
        var index = name.lastIndexOf("."), clsName, o, args;
        if (index != -1) {
            args = name.substring(0, index);
            o = S.namespace(args);
            clsName = name.substring(index + 1, name.length);
        }
        else {
            clsName = name;
            o = S;
        }
        return {
            clsName: clsName,
            namespace: o
        };
    };
    
    /**
     * 定义一个基础类，并且遍历指定的对象，拷贝到类的原型链上，并且调用原型链上的init的方法进行初始化。
     * 如果指定父类，则该类会继承于这个父类，并且可以使用inherit来便捷调用父级方法.
     * 
     *     Simple.declare('Animal',{
     *         getName:function(){
     *             return 'animal';
     *         }
     *     });
     *     Simple.declare('Bird',Simple.Animal,{
     *         getName:function(){
     *             var superResult = this.inherit(arguments);
     *             return superResult + ' bird';
     *         }
     *     });
     *     console.log(new Simple.Bird().getName());//will console animal bird
     *     
     * @method Simple.declare
     * @module declare
     * @static
     * @param {String} subCls
     * @param {Function} superCls
     * @param {Object} props
     * @return 定义后的构造函数
     */
    var declare = function(subCls, superCls, props){
        //参数判断
        if (!props) {
            props = superCls;
            superCls = null;
        }
        
        var clsInfo = _crackName(subCls);
        
        //生成构造函数
        subCls = clsInfo.namespace[clsInfo.clsName] = function(config){
            S.mixin(this, config);
			
            //如果存在父类,父类构造函数先执行
            //循环执行父级的构造函数
            if (subCls.base) {
                for (var i = 0; i < subCls.base.length; i++) {
                    subCls.base[i].apply(this, arguments);
                }
            }
            
            if (this.preamble) {
                this.preamble(arguments);
            }

            props.init && props.init.apply(this, arguments);
            
            if (this.afterInit) {
                this.afterInit(arguments);
            }
			
			
			
        }
        //继承
        if (superCls) {
            S.extend(subCls, superCls);
            subCls.base = [];
            if (superCls.base) {
                S.each(superCls.base, function(item){
                    subCls.base.push(item);
                });
            }
            subCls.base.push(subCls.superclass.init);
        }
        
        //copy props to subCls's prototype
        //store superCls method's name
        S.each(props, function(value, prop){
			
			
			subCls.prototype[prop] = value;
				
			if(superCls && typeof value === 'function'){
            /*if (typeof value === 'function' && method !== 'init') {
                subCls.prototype[method].superName = method;
            }*/
			//thx John Resig
			//add quick invoke method
			subCls.prototype[ prop ] = (function() {
				var inherit = function() {
						return superCls.prototype[ prop ].apply( this, arguments );
					},
					inheritApply = function( args ) {
						return superCls.prototype[ prop ].apply( this, args );
					};
				return function() {
					var _inherit = this.inherit,
						_inheritApply = this.inheritApply,
						returnValue;

					this.inherit = inherit;
					this.inheritApply = inheritApply;

					returnValue = value.apply( this, arguments );

					this.inherit = _inherit;
					this.inheritApply = _inheritApply;

					return returnValue;
				};
			})();
			
			}
			
        });
        //add quick invoke method
        /*if (superCls) {
            subCls.prototype.inherit = function(args){
                if (args.callee.superName) {
                   return subCls.superclass[args.callee.superName].call(this);
				   //return superCls.prototype[args.callee.superName].call(this);
                }
            }
        }*/
		
        subCls.plugins = {};
        subCls.plug = function(name, props){
            subCls.plugins[name] = props;
        };
        subCls.unplug = function(name){
            if (!name) {
                subCls.plugins = {};
            }
            else {
                subCls.plugins[name] = null;
                delete subCls.plugins[name];
            }
        };
		
        return subCls;
		
    }
    
    S.declare = declare;
	
    return declare;
});
