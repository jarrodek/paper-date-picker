(function () {

    Polymer({
        is: 'paper-date-picker-dialog',
        listeners: {
            'month.tap': '_showDatePicker',
            'day.tap': '_showDatePicker',
            'year.tap': '_showYearPicker',
            'dialog.coreOverlayOpenCompleted': '_dialogOpened'
        },
        properties: {
            /**
             * `value`, the selected date.
             *
             * @attribute value
             * @type String
             * @default undefined
             */
            value: {
                type: Object,
                observer: '_valueChanged'
            },
            /**
             * immediateDate, the currently selected
             * date. Even before hitting 'ok'.
             *
             * @attribute immediateDate
             * @type Date
             * @default today
             */
            immediateDate: {
                type: Object,
                value: new Date(),
                observer: '_immediateDateChanged'
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
                value: new Date(1900, 0, 1),
                observer: '_minChanged'
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
                value: new Date(2100, 11, 31),
                observer: '_maxChanged'
            },
            /**
             * Locale setting per the HTML5 Intl API
             * 
             * @attribute locale
             * @type Array
             * @default user system
             * 
             */
            locale: {
                type: Array,
                value: navigator.language,
                observer: '_localeChanged'
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
                value: 1,
                observer: '_startDayOfWeekChanged'
            },
            year: {
                type: Number,
                observer: '_yearChanged'
            },
            page: {
                type: Number,
                observer: '_pageChanged',
                value: 0
            }
        },
        dayOfWeek: '',
        dayOfMonth: 0,
        monthShortName: '',
        formattedYear: '',
        intl: {},
        rendered: false,
        _picker: undefined,
        ready: function () {
            this.rendered = true;
            if (this.value) {
//                        this.valueChanged();
                this.immediateDate = this.value;
            }
            this._localeChanged();
            this._immediateDateChanged();
        },
        open: function () {
            if (!this._picker) {
                this._picker = document.createElement('paper-date-picker');
                this._picker.min = this.min;
                this._picker.max = this.max;
                this._picker.date = this.immediateDate;
                this._picker.locale = this.locale;
                this._picker.startDayOfWeek = this.startDayOfWeek;
                this.$.datePicker.appendChild(this._picker);
                this._picker.addEventListener('date-changed', this._pickerValueChanged.bind(this));
            }
            this.$.dialog.open();
        },
        
        
        _pickerValueChanged: function(e){
            this.immediateDate = e.detail.value;
        },
        
        
        _dialogOpened: function () {
            this.$.yearPicker.refreshScrollPosition();
        },
        _showYearPicker: function () {
            this.page = 1;
        },
        _showDatePicker: function () {
            this.page = 0;
        },
        setDate: function () {
            if (this.immediateDate <= this.max && this.immediateDate >= this.min) {
                this.value = this.immediateDate;
                this.fire('value-changed');
            }
        },
        _localeChanged: function () {
            if (!this.locale) {
                this.locale = navigator.language || 'en_us';
                return;
            }
            this.intl = {};
            this.intl.dayOfWeek = Intl.DateTimeFormat(this.locale, {weekday: 'long'}).format;
            this.intl.day = Intl.DateTimeFormat(this.locale, {day: 'numeric'}).format;
            this.intl.shortMonth = Intl.DateTimeFormat(this.locale, {month: 'short'}).format;
            this.intl.year = Intl.DateTimeFormat(this.locale, {year: 'numeric'}).format;
            if (this._picker) {
                this._picker.locale = this.locale;
            }
        },
        _immediateDateChanged: function () {
            if (!this.rendered)
                return;
            this.dayOfWeek = this.intl.dayOfWeek(this.immediateDate);
            this.dayOfMonth = this.intl.day(this.immediateDate);
            this.monthShortName = this.intl.shortMonth(this.immediateDate);
            this.formattedYear = this.intl.year(this.immediateDate);

            this.year = this.immediateDate.getFullYear();
            this.fire('selection-changed');
            if (this._picker) {
                this._picker.date = this.immediateDate;
            }
        },
        _yearChanged: function () {
            if (this.immediateDate.getFullYear() === this.year)
                return;
            var newDate = this.immediateDate.setYear(this.year);
            if (newDate < this.min) {
                this.immediateDate = new Date(this.min);
            } else if (newDate > this.max) {
                this.immediateDate = new Date(this.max);
            } else {
                this.immediateDate = new Date(newDate);
            }
            this.page = 0;
        },
        _startDayOfWeekChanged: function () {
            if (this._picker) {
                this._picker.startDayOfWeek = this.startDayOfWeek;
            }
        },
        _pageChanged: function () {
            if (!this.rendered)
                return;

            if (this.page === 0) {
                this.$.day.classList.add("selected");
                this.$.month.classList.add("selected");
                this.$.year.classList.remove("selected");
            } else {
                this.$.day.classList.remove("selected");
                this.$.month.classList.remove("selected");
                this.$.year.classList.add("selected");
            }
            this.$$('#yearPicker').refreshScrollPosition();
        },
        _minChanged: function () {
            if (typeof this.min === "string") {
                this.min = new Date(this.min);
            }
            if (this._picker) {
                this._picker.min = this.min;
            }
        },
        _maxChanged: function () {
            if (typeof this.max === "string") {
                this.max = new Date(this.max);
            }
            if (this._picker) {
                this._picker.max = this.max;
            }
        },
        _valueChanged: function () {
            if (typeof this.value === "string") {
                this.value = new Date(this.value);
            }
        }
    });
})();