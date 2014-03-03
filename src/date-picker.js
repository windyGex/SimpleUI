define(function (require) {

    var $ = require('jquery'), declare = require('./declare');

    var Popup = require('./popup'), dateCache = {};

    /**
     * 日期选择基础类,提供最基本的日历渲染功能
     * @class Simple.DatePickerBase
     * @extends Simple.Widget
     * @module ui.date-picker
     */
    var DatePicker = declare('DatePicker', Popup, {

        /**
         * 为生成的el相对定位的节点
         * @property node
         * @type String
         * @default ''
         */
        node: null,

        selectDate: '',

        monthNames: ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"], // Names of months for drop-down and formatting
        monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // For formatting
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], // For formatting
        dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // For formatting
        dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], // Column headings for days starting at Sunday
        weekHeader: "Wk", // Column header for week of the
        /**
         * @property dateFormat
         * @type String
         * @default 'yyyy-mm-dd'
         *
         * ATOM: "yy-mm-dd", // RFC 3339 (ISO 8601)
         * COOKIE: "D, dd M yy",
         * ISO_8601: "yy-mm-dd",
         * RFC_822: "D, d M y",
         * RFC_850: "DD, dd-M-y",
         * RFC_1036: "D, d M y",
         * RFC_1123: "D, d M yy",
         * RFC_2822: "D, d M yy",
         * RSS: "D, d M y", // RFC 822
         * TICKS: "!",
         * TIMESTAMP: "@",
         * W3C: "yy-mm-dd",
         */
        dateFormat: "yy/mm/dd", // See format options on parseDate

        events: {
            'click [data-role=prevYear]': '_onDateYearCtrlPrevClick',
            'click [data-role=nextYear]': '_onDateYearCtrlNextClick',
            'click [data-role=prevMonth]': '_onDateMonthCtrlPrevClick',
            'click [data-role=nextMonth]': '_onDateMonthCtrlNextClick',
            'click [data-role=dateItem]': '_onDateContentClick'
        },
        /**
         * 生成EL的模版
         * @property template
         * @type String
         * @default ''
         */
        template: '<div class="sui-date-picker">\
            <div class="sui-date-control">\
                <div class="sui-date-year">\
                    <a class="sui-date-action sui-icon-font" data-role="prevYear" href="javascript:;">&#xf01a8;</a>\
                    <span class="" data-role="dateYear"></span>\
                    <a class="sui-date-action sui-icon-font" data-role="nextYear" href="javascript:;">&#xf01a9;</a>\
                </div>\
                <span class="sui-date-month">\
                    <a class="sui-date-action sui-icon-font" data-role="prevMonth" href="javascript:;">&#xf01a8;</a>\
                    <span class="" data-role="dateMonth"></span>\
                    <a class="sui-date-action sui-icon-font" data-role="nextMonth" href="javascript:;">&#xf01a9;</a>\
                </span>\
            </div>\
            <ul class="sui-date-week" data-role="dateWeek"><li>日</li><li>一</li><li>二</li>\
            <li>三</li><li>四</li><li>五</li><li>六</li>\
            </ul>\
            <ul data-role="dateContent" class="sui-date-content"></ul>\
            </div>',

        init: function () {
            this.after('show', function () {
                this.set('selectDate', this.currentTrigger.val());
            });
        },

        _onDateYearCtrlPrevClick: function (e) {
            this.currentYear = this.currentYear - 1;
            this._setDatePickerContent(this.currentYear, this.currentMonth);
            return false;
        },
        _onDateYearCtrlNextClick: function (e) {
            this.currentYear = this.currentYear + 1;
            this._setDatePickerContent(this.currentYear, this.currentMonth);
            return false;
        },
        _onDateMonthCtrlPrevClick: function (e) {
            if (this.currentMonth - 1 < 1) {
                this.currentMonth = 12;
                this.currentYear = this.currentYear - 1;
            } else {
                this.currentMonth = this.currentMonth - 1;
            }
            this._setDatePickerContent(this.currentYear, this.currentMonth);
            return false;
        },
        _onDateMonthCtrlNextClick: function (e) {

            if (this.currentMonth + 1 > 12) {
                this.currentMonth = 1;
                this.currentYear = this.currentYear + 1;
            } else {
                this.currentMonth = this.currentMonth + 1;
            }
            this._setDatePickerContent(this.currentYear, this.currentMonth);
            return false;
        },
        /*获取一个月有多少天*/
        _getMonthTotalDay: function (year, month) {
            return new Date(new Date(year, month, 1) - 864000).getDate();
        },
        /*获取一个月第一天是星期几*/
        _getMonthFirstDay: function (year, month) {
            return new Date(year, month - 1, 1).getDay();
        },
        _uiSetDayNamesMin: function(dayNamesShort){
            var html='';
            dayNamesShort.forEach(function(dayName){
                html+='<li>'+dayName+'</li>';
            });
            this.dateWeek.html(html);

        },
        _uiSetSelectDate: function (selectDate) {

            var year, month, day, date;

            if (!selectDate) {
                selectDate = this.formatDate(new Date(), this.get('dateFormat'));
            }
            try{
                date = this.parseDate(selectDate, this.get('dateFormat'));
            }catch (e){
                date = new Date();
            }

            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();

            this._setDatePickerContent(year, month, day);

        },
        _setDatePickerContent: function (year, month, day) {

            var year = parseInt(year, 10),
                month = parseInt(month, 10),
                day = parseInt(day, 10),

                totalDay = this._getMonthTotalDay(year, month),
                start = this._getMonthFirstDay(year, month),
                today = new Date().getDate(),
                currentMonth = new Date().getMonth() + 1,
                currentYear = new Date().getFullYear(),
                html = '',
                key = year + '_' + month,
                isToday,
                isSelectedDay;


            if (dateCache[key]) {
                html = dateCache[key];
            } else {

                for (var i = 0; i < totalDay + start; i++) {
                    if (i < start) {
                        html += '<li class="disabled"> &nbsp;</li>';
                    } else {
                        var date = (i - start + 1), cls = '';
                        isToday = (currentYear == year && currentMonth == month && date == today);
                        isSelectedDay = (date == day);
                        if (isToday) {
                            cls += 'class="current';
                        }
                        if (isSelectedDay) {
                            if (cls.length) {
                                cls += ' sui-date-picker-selected"';
                            } else {
                                cls += 'class="sui-date-picker-selected"';
                            }
                        } else if (isToday) {
                            cls += '"';
                        }
                        html += '<li ' + cls + ' data-role="dateItem">' + date + '</li>'
                    }
                }
                dateCache[key] = html;
            }
            this.dateContent.html(html);
            this.dateYear.html(year);
            this.dateMonth.html(month);
            this.currentYear = parseInt(year, 10);
            this.currentMonth = parseInt(month, 10);
        },

        _onDateContentClick: function (e) {
            var target = $(e.currentTarget);

            this.currentDay = parseInt(target.text(), 10);
            this.currentDate = this.formatDate(new Date(this.currentYear, this.currentMonth - 1, this.currentDay), this.get('dateFormat'));
            this.currentTrigger.val(this.currentDate);
            this.trigger('select', this.currentDate);
            this.hide();
        },
        //
        //@see https://github.com/jquery/jquery-ui/blob/master/ui/datepicker.js#L1101
        parseDate: function (value, format, settings) {

            value = (typeof value === "object" ? value.toString() : value + "");
            if (value === "") {
                return null;
            }

            var iFormat, dim, extra,
                iValue = 0,
                shortYearCutoffTemp = (settings ? settings.shortYearCutoff : null) || this.get('shortYearCutoff'),
                shortYearCutoff = (typeof shortYearCutoffTemp !== "string" ? shortYearCutoffTemp :
                    new Date().getFullYear() % 100 + parseInt(shortYearCutoffTemp, 10)),
                dayNamesShort = (settings ? settings.dayNamesShort : null) || this.get('dayNamesShort'),
                dayNames = (settings ? settings.dayNames : null) || this.get('dayNames'),
                monthNamesShort = (settings ? settings.monthNamesShort : null) || this.get('monthNamesShort'),
                monthNames = (settings ? settings.monthNames : null) || this.get('monthNames'),
                year = -1,
                month = -1,
                day = -1,
                doy = -1,
                literal = false,
                date,
            // Check whether a format character is doubled
                lookAhead = function (match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                },
            // Extract a number from the string value
                getNumber = function (match) {
                    var isDoubled = lookAhead(match),
                        size = (match === "@" ? 14 : (match === "!" ? 20 :
                            (match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))),
                        digits = new RegExp("^\\d{1," + size + "}"),
                        num = value.substring(iValue).match(digits);
                    if (!num) {
                        throw "Missing number at position " + iValue;
                    }
                    iValue += num[0].length;
                    return parseInt(num[0], 10);
                },
            // Extract a name from the string value and convert to an index
                getName = function (match, shortNames, longNames) {
                    var index = -1,
                        names = $.map(lookAhead(match) ? longNames : shortNames,function (v, k) {
                            return [
                                [k, v]
                            ];
                        }).sort(function (a, b) {
                                return -(a[1].length - b[1].length);
                            });

                    $.each(names, function (i, pair) {
                        var name = pair[1];
                        if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
                            index = pair[0];
                            iValue += name.length;
                            return false;
                        }
                    });
                    if (index !== -1) {
                        return index + 1;
                    } else {
                        throw "Unknown name at position " + iValue;
                    }
                },
            // Confirm that a literal character matches the string value
                checkLiteral = function () {
                    if (value.charAt(iValue) !== format.charAt(iFormat)) {
                        throw "Unexpected literal at position " + iValue;
                    }
                    iValue++;
                };

            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                        literal = false;
                    } else {
                        checkLiteral();
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case "d":
                            day = getNumber("d");
                            break;
                        case "D":
                            getName("D", dayNamesShort, dayNames);
                            break;
                        case "o":
                            doy = getNumber("o");
                            break;
                        case "m":
                            month = getNumber("m");
                            break;
                        case "M":
                            month = getName("M", monthNamesShort, monthNames);
                            break;
                        case "y":
                            year = getNumber("y");
                            break;
                        case "@":
                            date = new Date(getNumber("@"));
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case "!":
                            date = new Date((getNumber("!") - this._ticksTo1970) / 10000);
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case "'":
                            if (lookAhead("'")) {
                                checkLiteral();
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            checkLiteral();
                    }
                }
            }

            if (iValue < value.length) {
                extra = value.substr(iValue);
                if (!/^\s+/.test(extra)) {
                    throw "Extra/unparsed characters found in date: " + extra;
                }
            }

            if (year === -1) {
                year = new Date().getFullYear();
            } else if (year < 100) {
                year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                    (year <= shortYearCutoff ? 0 : -100);
            }

            if (doy > -1) {
                month = 1;
                day = doy;
                do {
                    dim = this._getMonthTotalDay(year, month);
                    if (day <= dim) {
                        break;
                    }
                    month++;
                    day -= dim;
                } while (true);
            }

            date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
                throw "Invalid date";
            }
            return date;
        },
        /**
         * 格式化日期
         * @param date
         * @param format
         * @see https://github.com/jquery/jquery-ui/blob/master/ui/datepicker.js#L1309
         * @return {String} 格式化后的日期
         */
        formatDate: function (date, format, settings) {
            if (!date) {
                return "";
            }

            var iFormat,
                dayNamesShort = (settings ? settings.dayNamesShort : null) || this.get('dayNamesShort'),
                dayNames = (settings ? settings.dayNames : null) || this.get('dayNames'),
                monthNamesShort = (settings ? settings.monthNamesShort : null) || this.get('monthNamesShort'),
                monthNames = (settings ? settings.monthNames : null) || this.get('monthNames'),
            // Check whether a format character is doubled
                lookAhead = function (match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                },
            // Format a number, with leading zero if necessary
                formatNumber = function (match, value, len) {
                    var num = "" + value;
                    if (lookAhead(match)) {
                        while (num.length < len) {
                            num = "0" + num;
                        }
                    }
                    return num;
                },
            // Format a name, short or long as requested
                formatName = function (match, value, shortNames, longNames) {
                    return (lookAhead(match) ? longNames[value] : shortNames[value]);
                },
                output = "",
                literal = false;

            if (date) {
                for (iFormat = 0; iFormat < format.length; iFormat++) {
                    if (literal) {
                        if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                            literal = false;
                        } else {
                            output += format.charAt(iFormat);
                        }
                    } else {
                        switch (format.charAt(iFormat)) {
                            case "d":
                                output += formatNumber("d", date.getDate(), 2);
                                break;
                            case "D":
                                output += formatName("D", date.getDay(), dayNamesShort, dayNames);
                                break;
                            case "o":
                                output += formatNumber("o",
                                    Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
                                break;
                            case "m":
                                output += formatNumber("m", date.getMonth() + 1, 2);
                                break;
                            case "M":
                                output += formatName("M", date.getMonth(), monthNamesShort, monthNames);
                                break;
                            case "y":
                                output += (lookAhead("y") ? date.getFullYear() :
                                    (date.getYear() % 100 < 10 ? "0" : "") + date.getYear() % 100);
                                break;
                            case "@":
                                output += date.getTime();
                                break;
                            case "!":
                                output += date.getTime() * 10000 + this._ticksTo1970;
                                break;
                            case "'":
                                if (lookAhead("'")) {
                                    output += "'";
                                } else {
                                    literal = true;
                                }
                                break;
                            default:
                                output += format.charAt(iFormat);
                        }
                    }
                }
            }
            return output;
        }
    });

    return DatePicker;
});
