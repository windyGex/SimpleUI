/**
 * @module _container
 */
define(function(require){

    var declare = require('./declare');

    /**
     * 用于管理组件之间的父子级关系
     * @class Simple._Container
     */
    return declare('_Container',{

        childs:[],
		
		init: function(){
			this._childsInc = this._childsInc || [];
            this._virtualChildsInc = this._virtualChildsInc || [];
            this._childsIncByKey = this._childsIncByKey || {};
		},

        renderChilds: function(){
            var  childs = this.get('childs');

            childs.forEach(function(child){
                var ctor = child.ctor;
                if(child.placeHolderContainer){
                    child.container = this.el.find(child.placeHolderContainer);
                }else{
                    child.container = this.el;
                }
                var childInc = new ctor(child);
                this.addChild(childInc,false);

            }.bind(this));
        },
        /**
         * 添加一个孩子对象
         * @param item 添加的对象
         * @param append 是否添加元素dom，如果不添加的话则为逻辑上的父子级关系
         */
        addChild: function (item, append) {
            if (typeof append === 'undefined') {
                append = true;
            }
            item._parent = this;
            if (append && item.el) {
                this.el.append(item.el);
            }
            if (!this._childsIncByKey[item.get('id')]) {
                this._childsIncByKey[item.get('id')] = item;
                this._childsInc.push(item);
            }
            return this;
        },
        
        removeChild: function(id){
            var currentIndex;
            this.getChildren().forEach(function(item,index){
                if(item.get('id') == id){
                    currentIndex = index;
                }
            });
            this.getChildren().splice(index,1);
            delete this._childsIncByKey[id];

            return this;
        },
        /**
         * 获取所有孩子节点
         * @returns {*|Array}
         */
        getChildren:function(id){
            if(id){
                return this._childsIncByKey[id];
            }
            return this._childsInc;
        },

        /**
         * 获取父级对象
         * @param id 根据id获取父级对象
         * @param strict 是否严格匹配
         * @return 匹配到的父级对象
         */
        getParent: function (id, strict) {
            if (!id) {
                return this._parent;
            } else {
                var parent = this._parent;
                if (strict) {
                    while (parent && parent.get('id') !== id) {
                        parent = parent._parent;
                    }
                } else {
                    while (parent && parent.get('id').indexOf(id) === -1) {
                        parent = parent._parent;
                    }
                }
                return parent;
            }
        },
		
        /**
         * 获取当前对象的下个节点
         * @returns {*}
         */
        getNext: function () {
            var parent = this.getParent(),
                children,
                self = this,
                currentIndex;

            if (parent) {
                children = parent.getChildren();
                children.forEach(function (child, index) {
                    if (child === self) {
                        currentIndex = index;
                        return false;
                    }
                });
                if (currentIndex != null) {
                    if (children[currentIndex + 1]) {
                        return  children[currentIndex + 1];
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return false;
        },
        /**
         * 获取当前对象的上个节点
         * @returns {*}
         */
        getPrev: function () {
            var parent = this.getParent(),
                children,
                self = this,
                currentIndex;
            if (parent) {
                children = parent.getChildren();
                children.forEach(function (child, index) {
                    if (child === self) {
                        currentIndex = index;
                        return false;
                    }
                });
                if (currentIndex != null) {
                    if (children[currentIndex - 1]) {
                        return  children[currentIndex - 1];
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }

            }
            return false;
        },
        /**
         * 获取根节点
         * @returns {_Container|*}
         */
        root: function () {
            var parent = this._parent;
            while (parent && parent._parent) {
                parent = parent._parent;
            }
            return parent;
        }
    });
});