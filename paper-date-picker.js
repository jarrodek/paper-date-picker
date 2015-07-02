(function () {

    //temp function before I think of better solution
    var cleanMonthDateArrayObject = function (obj) {
        var m = obj[0] % 12;
        return [m < 0 ? m + 12 : m, obj[1] + Math.floor(obj[0] / 12)];
    };
    Polymer({
        is: 'paper-date-picker',
        properties: {
            /**
             * Current date
             *
             * @attribute date
             * @type Date
             * @default 'today\'s date'
             */
            date: {
                type: Object,
                value: new Date(),
                observer: 'dateChanged',
                notify: true
            },
            /**
             * Lowest selectable date (inclusive)
             *
             * @attribute min
             * @type Date
             * @default 1/1/1900
             */
            min: {
                type: Object,
                value: new Date(1900, 0, 1)
            },
            /**
             * Highest selectable date (inclusive)
             *
             * @attribute max
             * @type Date
             * @default 31/12/2100
             */
            max: {
                type: Object,
                value: new Date(2100, 11, 31)
            },
            /**
             * Locale setting per the HTML5 Intl API
             * 
             * @attribute locale
             * @type Array
             * @default undefined
             * 
             */
            locale: {
                type: Array,
                value: navigator.language,
                observer: 'localeChanged'
            },
            /**
             * Start day of week, expressed as 0-6
             * 
             * @attribute startDayOfWeek
             * @type Integer
             * @default 1
             * 
             */
            startDayOfWeek: {
                type: Number,
                value: 1
            }
        },
        listeners: {
            'neon-animation-finish': '_onNeonAnimationFinish'
        },
        currentYear: 0,
        currentMonth: 0,
        currentDay: 0,
        loadedRange: 14,
        triggerRange: 1,
        loadPerTrigger: 7,
        weekDayNames: [],
        months: [],
        nonNumericDates: false,
        currentDateId: '',
        currentMonthId: '',
        _isReady: false,
        entryAnimation: 'slide-from-right-animation',
        exitAnimation: 'slide-left-animation',
        intl: {},
        ready: function () {
            this._isReady = true;
            if (!this.locale) {
                this.locale = navigator.language;
            }

            this.weekDayNames = [];
            for (var i = this.startDayOfWeek - 1; i < this.startDayOfWeek + 6; i++) {
                var date = new Date(2000, 1, i, 0, 0, 0);
                this.weekDayNames.push(new Intl.DateTimeFormat(this.locale, {weekday: 'narrow'}).format(date));
            }

            //Infininte scrolling doesn't work (nicely) on mobile devices, so
            // it is disabled by default.
            if (this.infiniteScrolling === 'auto') {
                if (typeof window.orientation !== 'undefined') {
                    this.infiniteScrolling = false;
                } else {
                    this.infiniteScrolling = true;
                }
            }

            this.surroundDate(this.date);
//            this.refreshScrollPosition();
            this.currentDateId = this.currentYear + '-' + this.currentMonth + '-' + this.currentDay;
            this.currentMonthId = this.currentYear + '-' + this.currentMonth;
            //this.dateChanged();
        },
        localeChanged: function () {
            if (!this.locale) {
                this.locale = navigator.language || 'en_us';
                return;
            }
            this.intl = {};
            this.intl.day = Intl.DateTimeFormat(this.locale, {day: 'numeric'}).format;
        },
        dateChanged: function () {
            this.setCurrentDateValues();
//            this.set('currentDateId', this.currentYear + '-' + this.currentMonth + '-' + this.currentDay);
//            this.currentDateId = this.currentYear + '-' + this.currentMonth + '-' + this.currentDay;
//            this.refreshScrollPosition();
        },
        renderMonths: function (start, end) {
            console.log('renderMonths', start, end);
            var _ts = performance.now();
            start = cleanMonthDateArrayObject(start);
            end = cleanMonthDateArrayObject(end);
            var curMonth = start[0];
            var curYear = start[1];
            var date, start, end;
            this.months = [];
            var _months = [];

            while (curYear < end[1] || (curYear === end[1] && curMonth <= end[0])) {

                var month = {
                    days: [],
                    name: "",
                    number: curMonth,
                    year: curYear
                };
                date = new Date(curYear, curMonth - 1, 1);
                startPoint = (date.getDay() - this.startDayOfWeek + 7) % 7;
                month.name = Intl.DateTimeFormat(this.locale, {month: 'long', year: 'numeric'}).format(date);
                date = new Date(curYear, curMonth, 0);
                endPoint = date.getDate();
                for (i = 0; i < startPoint; i++) {
                    month.days.push({visible: false});
                }

                for (i = 1; i <= endPoint; i++) {
                    var thisDate = new Date(curYear, curMonth - 1, i);
                    month.days.push({
                        n: i,
                        day: this.intl.day(thisDate),
                        enabled: thisDate >= this.min && thisDate <= this.max,
                        visible: true,
                        id: curYear + '-' + (curMonth) + '-' + i
                    });
                }

                _months[_months.length] = month;


                curMonth++;
                if (curMonth === 13) {
                    curMonth = 1;
                    curYear++;
                }
            }

            this.months = _months;
            var _pt = performance.now() - _ts;
            console.log('renderMonths time', _pt);
        },
        onSelect: function (e) {
            this.date = new Date(this.currentDateId);
            this.fire("selection-changed");
        },
        refreshScrollPosition: function () {
//            return;
//            if (!this._isReady) {
//                return;
//            }
//            this.async(function(){
//                var monthElements = Polymer.dom(this.root).querySelectorAll('.month');
//                var startLoadedDateOutsideTriggerRange = new Date(monthElements[this.triggerRange].dataset.year, monthElements[this.triggerRange].dataset.month * 1 - 1, 1);
//                var endLoadedDateOutsideTriggerRange = new Date(monthElements[monthElements.length - this.triggerRange - 1].dataset.year, monthElements[monthElements.length - this.triggerRange - 1].dataset.month * 1 - 1 + 1, 1);
//                if (!(this.date >= startLoadedDateOutsideTriggerRange && this.date < endLoadedDateOutsideTriggerRange)) {
//                    this.surroundDate(this.date);
//                }
//            });
        },
        setCurrentDateValues: function () {
            this.set('currentYear', this.date.getFullYear());
            this.set('currentMonth', this.date.getMonth() + 1);
            this.set('currentDay', this.date.getDate());
        },
//        scrollFinished: function () {
//            if (this.infiniteScrolling === true) {
//                var monthElements = Polymer.dom(this.root).querySelectorAll('.month');
//                for (var i = monthElements.length - 1; i >= 0; i--) {
//                    if (this.$.container.scrollTop + this.$.container.clientHeight / 2 > monthElements[i].offsetTop) {
//
//                        if (i < this.triggerRange) {
//                            var newStart = [monthElements[0].dataset.month * 1 - this.loadPerTrigger, monthElements[0].dataset.year * 1];
//                            var newEnd = [monthElements[monthElements.length - 1].dataset.month * 1 - this.loadPerTrigger, monthElements[monthElements.length - 1].dataset.year * 1];
//                            this.renderMonths(newStart, newEnd);
//                            this.$.container.scrollTop += monthElements[0].clientHeight * this.loadPerTrigger;
//                        }
//
//                        if (i > monthElements.length - this.triggerRange - 1) {
//                            var newStart = [monthElements[0].dataset.month * 1 + this.loadPerTrigger, monthElements[0].dataset.year * 1];
//                            var newEnd = [monthElements[monthElements.length - 1].dataset.month * 1 + this.loadPerTrigger, monthElements[monthElements.length - 1].dataset.year * 1];
//                            this.renderMonths(newStart, newEnd);
//                            this.$.container.scrollTop -= monthElements[0].clientHeight * this.loadPerTrigger;
//                        }
//
//                        break;
//                    }
//                }
//            }
//
//        },
        surroundDate: function (date) {
//            if (this.infiniteScrolling === true) {
//                var prevDate = [date.getMonth() + 1 - Math.floor(this.loadedRange / 2), date.getFullYear()];
//                var nextDate = [date.getMonth() + 1 + Math.ceil(this.loadedRange / 2), date.getFullYear()];
//            } else {
//                var prevDate = [1, date.getFullYear()];
//                var nextDate = [12, date.getFullYear()];
//            }
            var prevDate = [date.getMonth() - 3, date.getFullYear()];
            var nextDate = [date.getMonth() + 3, date.getFullYear()];
            this.renderMonths(prevDate, nextDate);
        },
        combineMonth: function (month) {
            return month.year + '-' + month.number;
        },
        prevMonth: function (e) {

            if (!this.currentMonthId)
                return;
            this.entryAnimation = 'slide-from-left-animation';
            this.exitAnimation = 'slide-right-animation';

            var model = e.model.month;
            var y = model.year;
            var m = model.number - 1;

            if (m <= 0) {
                m = 12;
                y--;
            }
            this.currentMonthId = y + '-' + m;
            this._awaitingDate = new Date(y, m-1, 1);
            //this.surroundDate(new Date(y,m-1,1));
        },
        nextMonth: function (e) {

            this.entryAnimation = 'slide-from-right-animation';
            this.exitAnimation = 'slide-left-animation';

            var model = e.model.month;
            var y = model.year;
            var m = model.number + 1;
            if (m > 12) {
                m = 1;
                y++;
            }
            this.currentMonthId = y + '-' + m;
            this._awaitingDate = new Date(y, m+1, 1);
            //this.surroundDate(new Date(y, m 1 1, 1));
        },
        
        _onNeonAnimationFinish: function(a,b){
            console.log(this._awaitingDate, b);
            if(this._awaitingDate){
                this.surroundDate(this._awaitingDate);
                this._awaitingDate = null;
            }
        }
    });
})();