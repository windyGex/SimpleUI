define(function(require){
    var $ = require('jquery'),
        declare = require('./declare'),
		keyMap = {
			TAB:9,
			ENTER : 13,
			SHIFT : 16,
			CTRL : 17,
			ALT : 18,
			ESCAPE : 27,
			SPACE : 32,
			END:35,
			HOME:36,
			LEFT_ARROW : 37,
			UP_ARROW : 38,
			RIGHT_ARROW : 39,
			DOWN_ARROW : 40
		};

    return declare('_KeyNavigation',{
		
		focusNode: null,
		
		focusKey:'',

        _linkShortCut: function(){

           this.focusNode.on('keyup.keynavigation',function(e){
                var keyCode = e.keyCode;
                switch(keyCode){
                    case keyMap.HOME:
					this._focusFirst();
					break;
					case keyMap.END:
					this._focusLast();
					break;
					case keyMap.LEFT_ARROW:
					case keyMap.UP_ARROW:
					this._focusPrev();
					break;
					case keyMap.RIGHT_ARROW:
					case keyMap.DOWN_ARROW:
					this._focusNext();
					break;
                }
           }.bind(this));
        },

		_focusFirst:function(){

		},
		
		_focusLast: function(){

		},
		_focusNext: function(){
            console.log('next');
		},
		_focusPrev: function(){

		}
    });
});