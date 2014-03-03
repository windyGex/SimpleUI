define(function() {

	return {
		// support transition
		transition: (function() {
			var transitionEnd = (function() {
				var el = document.createElement('div'),
					transEndEventNames = {
						'WebkitTransition': 'webkitTransitionEnd',
						'MozTransition': 'transitionend',
						'OTransition': 'oTransitionEnd otransitionend',
						'transition': 'transitionend'
					},
					transformNames = {
						'WebkitTransition': '-webkit-transform',
						'MozTransition': '-moz-transform',
						'OTransition': '-o-transform',
						'transition': 'transform'
					},name
				
				for (name in transEndEventNames) {
					if (el.style[name] !== undefined) {
						return {
							transform:transformNames[name],
							attr: name,
							eventType: transEndEventNames[name]
						}
					}
				}
				
				return false;
				
			}());
			
			return transitionEnd;
		})()
		
	};
});