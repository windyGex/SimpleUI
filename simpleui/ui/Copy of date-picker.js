define(['simple','declare','widget','text!template/date-picker','css!css/date-picker'],function(S,declare,Widget,template){
	

	var $ = S.$,DatePickerBase,DatePicker,dateCache={}
    
    /**
     * 日期选择基础类,提供最基本的日历渲染功能
     * @class Simple.DatePickerBase
     * @extends Simple.Widget
     * @module ui.date-picker
     */
	DatePickerBase = declare('DatePickerBase',Widget,{
        /**
		 * 为生成的el添加的类
		 * @property className
		 * @type String
		 * @default 'simple-date-picker'
		 */
		className:'simple-date-picker',
		/**
		 * 为生成的el相对定位的节点
		 * @property node
		 * @type String
		 * @default ''
		 */
		node:null,
        /**
		 * 为生成的el指定父级容器
		 * @property container
		 * @type HTMLElement
		 * @default document.body
		 */
		container:document.body,
        /**
		 * 生成EL的模版
		 * @property template
		 * @type String
		 * @default ''
		 */
		template:template,

		//onSelect:$.noop,

		renderUI:function(){

			this.set('select',this.select);
			this.setPosition(this.el,this.node,'lt lb');

		},
		bindUI:function(){
			//选中日期绑定事件
			
			this.dateYearCtrlPrev.on('click',$.proxy(this._onDateYearCtrlPrevClick,this));
			this.dateYearCtrlNext.on('click',$.proxy(this._onDateYearCtrlNextClick,this));
			this.dateMonthCtrlPrev.on('click',$.proxy(this._onDateMonthCtrlPrevClick,this));
			this.dateMonthCtrlNext.on('click',$.proxy(this._onDateMonthCtrlNextClick,this));
		},
		_onDateYearCtrlPrevClick:function(e){
			this.currentYear = this.currentYear -1;
			this._setDatePickerContent(this.currentYear,this.currentMonth);
			return false;
		},
		_onDateYearCtrlNextClick:function(e){
			this.currentYear = parseInt(this.currentYear) +1;
			this._setDatePickerContent(this.currentYear,this.currentMonth);
			return false;
		},
		_onDateMonthCtrlPrevClick:function(e){
			this.currentMonth = this.currentMonth -1 < 1 ? 12 : this.currentMonth -1;
			this._setDatePickerContent(this.currentYear,this.currentMonth);
			return false;
		},
		_onDateMonthCtrlNextClick:function(e){
			this.currentMonth = this.currentMonth +1 > 12 ? 1 : this.currentMonth +1;
			this._setDatePickerContent(this.currentYear,this.currentMonth);
			return false;
		},
		/*获取一个月有多少天*/
		_getMonthTotalDay:function(year,month){
			 return new Date(new Date(year,month,1) - 864000 ).getDate();
		},
		/*获取一个月第一天是星期几*/
		_getMonthFirstDay:function(year,month){
			return new Date(year,month-1,1).getDay();
		},
		_setterSelect:function(select){
			var year = new Date().getFullYear(),
				month = new Date().getMonth()+1,
				day = new Date().getDate();
			if(!select){
				select = year+'-'+month+'-'+day;
			}
			year = select.split('-')[0],
			month = select.split('-')[1],
			day = select.split('-')[2];
			
			this._setDatePickerContent(year,month,day);
			
			return select;
			
		},
		_setDatePickerContent:function(year,month,day){

			var totalDay = this._getMonthTotalDay(year,month),
				start = this._getMonthFirstDay(year,month),
				today = new Date().getDate(),
				currentMonth = new Date().getMonth()+1,
				currentYear = new Date().getFullYear(),
				html ='',
				key = year+'_'+month,
				isToday,
				isSelectedDay;

			if(dateCache[key]){
				html =dateCache[key];
			}else{


			for(var i=1;i<=totalDay+start-1;i++){
			
                    if(i<start){
                        html+="<li class='disabled'>&nbsp;</li>"
                    }else{
                        var date = (i-start+1),cls='';
						isToday = (currentYear == year && currentMonth == month && date==today);
						isSelectedDay = (date == day);
						if(isToday){
							cls+='class="current';
						}
						if(isSelectedDay){
							if(cls.length){
								cls+=' simple-date-picker-selected"';
							}else{
								cls+='class="simple-date-picker-selected"';
							}
						}else if(isToday){
							cls+='"';
						}
                        html+='<li '+cls+'>'+date+'</li>'
                    }
                }

                dateCache[key] = html;

              }

             this.dateContent.html(html);

             this.dateYear.html(year);

             this.dateMonth.html(month);

             this.currentYear = parseInt(year);

             this.currentMonth = parseInt(month);

		}

	});
	var datePickerInc;
	
	function showDatePicker(triggerNode){
		
		if(!datePickerInc){
		
			datePickerInc = new DatePickerBase({
				container:null,
				node:triggerNode
			});
			
		}
		datePickerInc.show();
		datePickerInc.setPosition(datePickerInc.el,triggerNode,'lt lb');
		
		return datePickerInc;
		
	}
	
	function hideDatePicker(triggerNode){
	
		datePickerInc.hide();
		
	}
	
	/**
     * 日期选择管理器类，beta版本，since SimpleUI 2.0
     * 
     *     require(['ui/date-picker'],function(){
     *         $('input').datepicker();
     *     });
     * @class Simple.DatePicker
     * @extends Simple.Widget
     */
	DatePicker = declare('DatePicker',Widget,{
		/**
		 * 提供日历功能的节点
		 * @property node
		 * @type String
		 * @default ''
		 */
		node:[],
		
		select:null,
		/**
		 * 选中一天后触发的事件
		 * @property onSelect
		 * @type Function
		 * @default empty Function
		 */
		onSelect:$.noop,
		
		initBaseEvents:function(){
		
			this.node.on('click',$.proxy(this._onClick,this));
			
			$(document).on('click.datepicker',$.proxy(this.hide,this));
		
		},
		
		_bindUI:function(){
			
			this.datePickerInc.dateContent
			.undelegate('.datepicker')
			.delegate('li','click.datepicker',$.proxy(this._onDateContentClick,this));
		
		},
		_setterSelect:function(select){
			if(typeof select == 'string'){
				
				this.datePickerInc.set('select',select);
			
			}
			
		},
		_onClick:function(e){
		
			var target = $(e.currentTarget);
			
			this.datePickerInc = showDatePicker(target);
			
			this.datePickerInc.set('select',this.select);
			
			this.currentTriggerNode = target;
			
			this.el = this.datePickerInc.el;
			
			this._bindUI();
			
			return false;
			
		},
		_onDateContentClick:function(e){
			var target = $(e.currentTarget),date

			if(/disable/.test(target.attr('class'))){
				return false;
			}
			this.currentDay = target.text();
			this.currentDate = this.datePickerInc.currentYear +'-'+this.datePickerInc.currentMonth+'-'+this.currentDay;
			if(this.onSelect.call(this.currentTriggerNode,this.currentDate) === false){
				return;
			}
			
			this.currentTriggerNode.val(this.currentDate);
			
			this.trigger('select',this.currentDate);
		}
		
	});
	
	S.bridgeTojQuery('datepicker',DatePicker);
	
	return DatePicker;
});