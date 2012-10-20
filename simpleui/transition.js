define(['simple', 'attribute', 'declare', 'support'], function(S, Attribute, declare, support) {
	
	var $ = S.$, Transition;
	
	/**
	 * 为SimpleUI的组件提供缓动效果，此效果使用CSS3的transition属性实现，目前包含slide,drop,fade,sacle等四种效果。 在低级浏览器下只有机械式的显示隐藏
	 * 
	 * @module transition
	 * @class Simple.Transition
	 * @extends Simple.Attribute
	 */
	Transition = declare('Transition', Attribute, {
		/**
		 * 缓动动画时间间隔
		 * 
		 * @property time
		 * @type int
		 */
		time: 150,
		/**
		 * 缓动动画效果类型,可选值有 slide,drop,fade,sacle
		 * 
		 * @property type
		 * @type String
		 */
		type: 'slide',
		/**
		 * 设置缓动的节点
		 * 
		 * @property node
		 * @type String | HTMLElement
		 */
		node: '',
		init: function() {
			this.node = $(this.node);
			this.set('type', this.type);
		},
		_setterType: function(type) {
			this._mapType(type, this.time);
			if ($.support.transition) {
				this.node.css(this.transitionBefore);
			}
			return type;
		},
		/**
		 * 显示该节点
		 * 
		 * @method show
		 */
		/**
		 * 显示该节点后触发的事件
		 * 
		 * @event show
		 */
		show: function() {
			var self = this;
			this.node.show();
			if ($.support.transition) {
				setTimeout(function() {
					self.node.css(self.transitionAfter);
					self.trigger('show');
				}, this.time);
			} else {
				self.trigger('show');
			}
		},
		/**
		 * 隐藏该节点
		 * 
		 * @method hide
		 */
		/**
		 * 隐藏该节点后触发的事件
		 * 
		 * @event hide
		 */
		hide: function() {
			var self = this;
			if ($.support.transition) {
				this.node.css(this.transitionBefore);
				this.node.one($.support.transition.eventType, function() {
					$(this).hide();
					self.trigger('hide');
				});
			} else {
				this.node.hide();
				this.trigger('hide');
			}
			
		},
		destroy:function(){
			this.node.css($.support.transition.attr,'none');
		},
		/**
		 * 建立缓动效果到属性之间的映射
		 * 
		 * @method _mapType
		 * @param type {String}
		 * @param time {Int}
		 * @private
		 */
		_mapType: function(type, time) {
			var transitionBefore, transitionAfter;
			switch (type) {
				case 'slide':
					transitionBefore = {
						opacity: 0,
						transform: 'translateY(-10px)'
					};
					transitionBefore[$.support.transition.attr] = 'opacity ' + (time / 1000) + 's ease-in-out,'
							+ $.support.transition.transform + ' ' + (time / 1000) + 's  ease-in-out';
					transitionAfter = {
						opacity: 1,
						transform: 'translateY(0px)'
					}
					break;
				case 'drop':
					transitionBefore = {
						opacity: 0,
						transform: 'translateX(-10px)'
					};
					transitionBefore[$.support.transition.attr] = 'opacity ' + (time / 1000) + 's  ease-in-out, '
							+ $.support.transition.transform + ' ' + (time / 1000) + 's  ease-in-out';
					transitionAfter = {
						opacity: 1,
						transform: 'translateX(0px)'
					}
					break;
				case 'fade':
					transitionBefore = {
						opacity: 0
					};
					transitionBefore[$.support.transition.attr] = 'opacity ' + (time / 1000) + 's  ease-in-out';
					transitionAfter = {
						opacity: 1
					}
					break;
				
				case 'scale':
					transitionBefore = {
						opacity: 0,
						transform: 'scale(1.3)'
					};
					transitionBefore[$.support.transition.attr] = 'opacity ' + (time / 1000) + 's  ease-in-out,'
							+ $.support.transition.transform + ' ' + (time / 1000) + 's  ease-in-out';
					transitionAfter = {
						opacity: 1,
						transform: 'scale(1)'
					}
			}
			
			this.transitionBefore = transitionBefore;
			this.transitionAfter = transitionAfter;
		}
	});
	
	S.bridgeTojQuery('transition', Transition);
	
	return Transition;
});