define(['simple', 'declare', 'widget'], function(S, declare,
		Widget, template) {
	
	var $ = S.$, DatePickerBase, DatePicker,
		dateCache = {};
	
	// 操作日期工具类
	
	

	DatePickerBase = declare('DatePickerBase', Widget, {
		
		/**
		 * 为生成的el添加的类
		 * 
		 * @property className
		 * @type String
		 * @default 'simple-date-picker'
		 */
		className: 'simple-date-picker',
		
		/**
		 * 为生成的el相对定位的节点及触发事件的节点
		 * 
		 * @property node
		 * @type String
		 * @default ''
		 */
		node: '',
		/**
		 * 指定选中的日期，格式为2012-12-06
		 * 
		 * @property select
		 * @type String
		 * @default ''
		 */
		selected: '',
		/**
		 * 格式化输出的日期
		 * 
		 * @property format
		 * @type String
		 * @default 'YYYY-MM-DD'
		 */
		format: 'YYYY-MM-DD',
		/**
		 * 开始的日期
		 * 
		 * @property startDate
		 * @type String
		 * @default ''
		 */
		startDate: '',
		/**
		 * 结束的日期
		 * 
		 * @property endDate
		 * @type String
		 * @default ''
		 */
		endDate: '',

		/**
		 * 选中日期触发的事件
		 * 
		 * @event select
		 * @param date {String} 选中的日期
		 */
		listeners: {
			'select': $.noop
		},
		/**
		 * 生成el的模版
		 * 
		 * @property template
		 * @type String
		 * @default ''
		 */
		template: template,
		
		renderUI: function() {
			this.set('selected',this.selected);
		},
		/**
		 * 渲染日期控件HTML
		 * @method _setterSelected
		 * @param selected {String} 选中的日期
		 * @protected
		 */
		_setterSelected: function(selected) {
			var date, dateHtml;
			// 如果没有指定选中日期则选中今天
			if (selected) {
				date = this._parseDate(selected, this.format);
			} else {
				date = this._getToday();
			}
			this._setDatePickerContent(date);
			
			return selected;
		},
		_setDatPickerContent: function(date) {
			var year = date.year,
				month = date.month,
				date = date.date,
				startDay = this._getFirstDay(year, month),
				totalDate = this._getTotalDate(year, month),
				prevTotalDate = this._getTotalDate(year,month-1),
				nextTotalDate = this._getTotalDate(year,month+1);
				
			
			
			
		},
		/**
		 * 根据format格式解析给出的日期
		 * @method _parseDate
		 * @param dateString {String} 给出的日期
		 * @param format {String} 日期格式
		 * @private
		 */
		_parseDate: function(dateString, format) {
			var year, month, date, dateArr;
			switch (format) {
				case 'YYYY-MM-DD':
					dateArr = dateString.split('-');
					year = dateArr[0];
					month = dateArr[1];
					date = dateArr[2];
					break;
			}
			return {
				year: year,
				month: month,
				date: date
			}
		},
		/**
		 * 得到今天的具体日期
		 * 
		 * @method __getToday
		 * @private
		 */
		_getToday: function() {
			var date = new Date();
			return {
				year: date.getFullYear(),
				month: date.getMonth() + 1,
				date: date.getDate()
			}
		},
		/**
		 * 获取一个月有多少天
		 * 
		 * @method _getTotalDate
		 * @param year {String} 给出指定的年份
		 * @param month {String} 给出指定的月份
		 * @private
		 */
		_getTotalDate: function(year, month) {
			return new Date(new Date(year, month, 1) - 864000).getDate();
		},
		/**
		 * 获取一个月第一天是星期几
		 * 
		 * @method __getFirstDay
		 * @param year {String} 给出指定的年份
		 * @param month {String} 给出指定的月份
		 * @private
		 */
		_getFirstDay: function(year, month) {
			return new Date(year, month - 1, 1).getDay();
		}
		
	});
	
	S.bridgeTojQuery('datepicker', DatePicker);
	
	return DatePicker;
});