(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'exports'], function ($, exports) {
      root.daterangepicker = factory(root, exports, $);
    });

  } else if (typeof exports !== 'undefined') {
    factory(root, exports);

    // Finally, as a browser global.
  } else {
    root.daterangepicker = factory(root, {}, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function (root, daterangepicker, $) {
  var datePickerStart = null, datePickerEnd = null;
  var startDateElt = null, endDateElt = null, startDateCompareElt = null, endDateCompareElt = null;
  var startDateInfo = null, endDateInfo = null;
  var periodElt = null;
  var compareElt = null, compareOptions = null;
  var infoFormat = null, format = null;
  var container = null;
  var info = null;
  var callback = null;
  var periods = [];
  var defaultPeriod = null;
  var opens = null;

  var addPeriod = function (_period) {
    var period = _period();
    periods.push(
      {
        name: period.name,
        callback: function(){
          var end = period.end;
          endDateElt.val(end.format(format));
          startDateElt.val(period.start.format(format));
        },
        active: true
      }
    );
  };

//  var removePeriods = function (periods) {
//    periods.push(
//      {
//        name: period.name,
//        value: period.value,
//        callback: function(){
//          startDateElt.val(period.start().format(format));
//          endDateElt.val(period.end().format(format));
//        },
//        active: true
//      }
//    );
//  };

  var DateRangePicker = function (element, options, cb) {
    this.element = $(element);
    this.parentEl = $('body');

    var DRTInfo = '<div>'+
      '<button id="datepickerExpand" class="btn btn-default" type="button">' +
      '<span class="hidden-xs"> ' +
      '<strong class="text-info" id="datepicker-from-info"></strong>' +
      ' - '+
      '<strong class="text-info" id="datepicker-to-info"></strong>' +
      '<strong class="text-info" id="datepicker-diff-info"></strong>' +
      '</span>'+
      '&nbsp;<i class="fa fa-caret-down"></i></button>'+
      '</div>';
    var DRPTemplate =
      '<div class="datepicker dropdown-menu opensleft show-calendar hide" style="display: block;">'+
      '<div id="datepicker1" class="calendar left" data-date=""></div>'+
      '<div id="datepicker2" class="calendar right" data-date=""></div>'+
      '<div class="ranges">'+
      '<select id="range" class="form-control fixed-width-lg pull-left">'+
      '</select>'+
      '<div class="range_inputs">'+
      '<div class="datepicker_start_input">'+
      '<label for="datepicker_start">From</label>'+
      '<input class="date-input input-mini" type="text" id="date-start" name="datepicker_start" />'+
      '</div>'+
      '<div class="datepicker_end_input">'+
      '<label for="datepicker_end">To</label>'+
      '<input class="date-input input-mini" type="text" id="date-end" name="datepicker_end" />'+
      '</div>'+
      '<div class="datepicker_compare">'+
      '<label for="datepicker-compare">'+
      '<input type="checkbox" id="datepicker-compare" name="datepicker_compare" tabindex="3" />'+
      'Compare to'+
      '</label>'+
      '<select id="compare-options" class="form-control fixed-width-lg pull-left" disabled name="compare_date_option">'+
      '<option value="1" selected="selected" label="Previous period">Previous period </option>'+
      '<option value="2" label="Previous Year">Previous year</option>'+
      '<option value="3" label="Custom">Custom</option>'+
      '</select>'+
      '</div>'+
      '<div id="form-date-body-compare" style="display: none"><div class="datepicker_start_input">'+
      '<label for="datepicker_start">From</label>'+
      '<input class="date-input input-mini" type="text" id="date-start-compare" name="datepicker_start" />'+
      '</div>'+
      '<div class="datepicker_end_input">'+
      '<label for="datepicker_end">To</label>'+
      '<input class="date-input input-mini" type="text" id="date-end-compare" name="datepicker_end" />'+
      '</div></div>'+
      '<div class="datepicker_buttons">'+
      '<button class="applyBt btn btn-small btn-sm btn-success">Apply</button>&nbsp;'+
      '<button class="cancelBt btn btn-small btn-sm btn-default">Cancel</button>'+
      '</div>'+
      '</div>'+
      '</div>'+
      '</div>'+
      '</div>';

    if (typeof options !== 'object' || options === null)
      options = {};

    info = $(DRTInfo).appendTo(this.element);
    container = $(DRPTemplate).appendTo(this.parentEl);

    startDateElt = container.find('#date-start');
    endDateElt = container.find('#date-end');
    startDateCompareElt = container.find('#date-start-compare');
    endDateCompareElt = container.find('#date-end-compare');
    compareElt = container.find('#datepicker-compare');
    compareOptions = container.find('#compare-options');
    startDateInfo = info.find('#datepicker-from-info');
    endDateInfo = info.find('#datepicker-to-info');
    periodElt = container.find('#range');

    [function (){
      var date = new Date();
      return {
        name: "Today",
        start: date,
        end: date
      }
    },
      function (){
        var date = new Date().subDays(1);
        return {
          name: "Yesterday",
          start: date,
          end:  date
        };
      },
      function (){
        var end = new Date().subDays(1);
        return {
          name: "Last 30 days",
          end:  end,
          start: new Date(end).subDays(30)
        };
      },
      function (){
        var end = new Date().subDays(1);
        return {
          name: "Current Month",
          end:  end,
          start: new Date(new Date(end).setDate(1))
        };
      },
      function (){
        var now = new Date();
        var end = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          name: "Previous Month",
          end:  end,
          start: new Date(new Date(end).setDate(1))
        }
      },
      function (){
        var end = new Date();
        return {
          name: "Current Year",
          end: end,
          start: new Date(end.getFullYear(), 0, 1)
        };
      },
      function (){
        var end = new Date(new Date().getFullYear(), 11, 31).subYears(1);
        return {
          name: "Previous Year",
          end: end,
          start: new Date(end.getFullYear(), 0, 1)
        };
      }].forEach(function(period){
        addPeriod(period);
      });

    this.setOptions(options, cb);

    periods.forEach(function(period){
      if (period.active)
        periodElt.append($("<option></option>").val(period.name).html(period.name));
    });
    if (defaultPeriod)
      periodElt.val(defaultPeriod);

    datePickerStart = container.find('#datepicker1').calendar({
      "dates": translated_dates,
      "weekStart": 1,
      "format": format
    }).on('changeDate', function (ev) {
      if (ev.date.valueOf() >= datePickerEnd.viewDate.valueOf()) {
        datePickerEnd.setValue(ev.date.setMonth(ev.date.getMonth() + 1));
      }
    }).on('mouseenter', function () {
      datePickerEnd.fillMonthStart();
    }).on('pickerChange', $.proxy(this.datePickerStartChange, this))
      .data('calendar');

    datePickerEnd = container.find('#datepicker2').calendar({
      "dates": translated_dates,
      "weekStart": 1,
      "format": format
    }).on('changeDate', function (ev) {
      if (ev.date.valueOf() <= datePickerStart.viewDate.valueOf()) {
        datePickerStart.setValue(ev.date.setMonth(ev.date.getMonth() - 1));
      }
    }).on('mouseenter', function () {
      datePickerStart.fillMonthEnd();
    }).on('pickerChange', $.proxy(this.datePickerEndChange, this))
      .data('calendar');

    this.move();

    var startDate = this.start();
    var endDate = this.end();

    if (startDate.getFullYear() == endDate.getFullYear() && startDate.getMonth() == endDate.getMonth())
      datePickerStart.setValue(startDate.subMonths(1));

    //Events binding
    startDateElt.on('change', $.proxy(this.dateChange, this));
    endDateElt.on('change', $.proxy(this.dateChange, this));
    startDateCompareElt.on('change', $.proxy(this.dateChange, this));
    endDateCompareElt.on('change', $.proxy(this.dateChange, this));
    compareElt.on('click', $.proxy(this.compareClick, this));
    compareOptions.on('change', $.proxy(this.compareOptionsChange, this));

    periodElt.on('change', $.proxy(this.periodChange, this));

    if (startDateElt.val() != '')
      this.dateChange();
    else
      periodElt.trigger('change');

    container.find('.cancelBt').click(function () {
      container.addClass('hide');
    });

    container.show(function () {
      startDateElt.focus();
    });

    startDateElt.focus(function () {
      datePickerStart.setCompare(false);
      datePickerEnd.setCompare(false);
      container.find(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    endDateElt.focus(function () {
      datePickerStart.setCompare(false);
      datePickerEnd.setCompare(false);
      container.find(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    startDateCompareElt.focus(function () {
      datePickerStart.setCompare(true);
      datePickerEnd.setCompare(true);
      compareOptions.val(3);
      container.find(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    endDateCompareElt.focus(function () {
      datePickerStart.setCompare(true);
      datePickerEnd.setCompare(true);
      compareOptions.val(3);
      container.find(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    info.find('#datepickerExpand').on('click', function () {
      if (container.hasClass('hide')) {
        container.removeClass('hide');
        startDateElt.focus();
      }
      else
        container.addClass('hide');
    });
  };

  DateRangePicker.prototype = {
    constructor: DateRangePicker,

    datePickerChange: function (event, input, value) {
      var element = null;
      switch (input) {
        case 'date-start':
          element = startDateElt;
          break;
        case 'date-end':
          element = endDateElt;
          break;
        case 'date-start-compare':
          element = startDateCompareElt;
          break;
        case 'date-end-compare':
          element = endDateCompareElt;
          break;
      }
      if (element && value) {
        element.val(new Date(value).format(format));
        element.removeClass("input-selected").addClass("input-complete");
        if (element === endDateElt) {
          this.dateChange();
        }
        else {
          this.notify();
        }
      }
      return element;
    },

    datePickerStartChange: function (event, input, value) {
      var element = this.datePickerChange(event, input, value);
      if (element == startDateElt || element == startDateCompareElt)
        datePickerEnd.clearRange();
    },

    datePickerEndChange: function (event, input, value) {
      var element = this.datePickerChange(event, input, value);
      if (element == startDateElt || element == startDateCompareElt)
        datePickerStart.clearRange();
    },

    dateChange: function (event) {
      this.updateCalendarRange();
      this.updateCalendarCompareRange();
      this.notify();
      this.updateDateInfo();
    },

    compareOptionsChange: function (event) {
      this.updateCalendarCompareRange();
      this.notify();
      if (event.target.value == 3)
        startDateCompareElt.focus();
    },

    compareClick: function (event) {
      if (compareElt.is(':checked')) {
        compareOptions.trigger('change');
        this.compareActivate();
      } else {
        this.compareDeactivate();
        this.notify();
      }
    },

    periodChange: function (event) {
      periods.forEach(function(period){
        if (period.name == event.target.value)
          period.callback();
      });
      this.dateChange();
    },

    setComparePreviousPeriod: function () {
      var startDate = Date.parseDate(startDateElt.val(), format).subDays(1);
      var endDate = Date.parseDate(endDateElt.val(), format).subDays(1);

      var diff = endDate - startDate;
      var startDateCompare = new Date(startDate - diff);

      endDateCompareElt.val(startDate.format(format));
      startDateCompareElt.val(startDateCompare.format(format));
    },

    setComparePreviousYear: function () {
      var startDate = Date.parseDate(startDateElt.val(), format).subYears(1);
      var endDate = Date.parseDate(endDateElt.val(), format).subYears(1);

      startDateCompareElt.val(startDate.format(format));
      endDateCompareElt.val(endDate.format(format));
    },

    compareActivate: function() {
      container.find('#form-date-body-compare').show();
      compareOptions.prop('disabled', false);
    },

    compareDeactivate: function() {
      datePickerStart.setStartCompare(null);
      datePickerStart.setEndCompare(null);
      datePickerEnd.setStartCompare(null);
      datePickerEnd.setEndCompare(null);
      container.find('#form-date-body-compare').hide();
      compareOptions.prop('disabled', true);
      startDateElt.focus();
    },

    updatePickerInput: function (start, end, startCompare, endCompare, compare) {
      if (start)
        startDateElt.val(new Date(start).format(format));
      if (end)
        endDateElt.val(new Date(end).format(format));
      if (startCompare)
        startDateCompareElt.val(new Date(startCompare).format(format));
      if (endCompare)
        startDateCompareElt.val(new Date(endCompare).format(format));
      compareElt.prop('checked', compare);
      this.updateCalendarRange();
      if (compare) {
        this.compareActivate();
        this.updateCalendarCompareRange();
      }
      else
        this.compareDeactivate();
      this.updateDateInfo();
    },

    updateCalendarRange: function () {
      datePickerStart.setStart(startDateElt.val());
      datePickerStart.setEnd(endDateElt.val());
      datePickerEnd.setStart(startDateElt.val());
      datePickerEnd.setValue(Date.parseDate(endDateElt.val(), format).setDate(1));
      datePickerStart.setValue(datePickerStart.date.setFullYear(datePickerEnd.date.getFullYear(), datePickerEnd.date.getMonth() - 1, 1));
      datePickerStart.updateRange();
      datePickerEnd.updateRange();
    },

    updateCalendarCompareRange: function () {
      if (compareElt.is(':checked')) {
        var compare = true;
        if (compareOptions.val() == 1) {
          compare = false;
          this.setComparePreviousPeriod();
        }

        if (compareOptions.val() == 2) {
          compare = false;
          this.setComparePreviousYear();
        }
        datePickerStart.setStartCompare(startDateCompareElt.val());
        datePickerStart.setEndCompare(endDateCompareElt.val());
        datePickerEnd.setStartCompare(startDateCompareElt.val());
        datePickerEnd.setEndCompare(endDateCompareElt.val());
        datePickerStart.setCompare(compare);
        datePickerEnd.setCompare(compare);
      }
    },

    updateDateInfo: function () {
      startDateInfo.html(moment(this.start()).format(infoFormat));
      endDateInfo.html(moment(this.end()).format(infoFormat));
    },

    notify: function () {
      if (callback)
        callback(this.start(), this.end(), this.compareStart(), this.compareEnd(), this.compare());
    },

    start: function () {
      return Date.parseDate(startDateElt.val(), format);
    },

    end: function () {
      return Date.parseDate(endDateElt.val(), format);
    },

    compareStart: function () {
      return Date.parseDate(startDateCompareElt.val(), format);
    },

    compareEnd: function () {
      return Date.parseDate(endDateCompareElt.val(), format);
    },

    compare: function () {
      return compareElt.is(':checked');
    },

    move: function () {
      var parentOffset = { top: 0, left: 0 };
      if (!this.parentEl.is('body')) {
        parentOffset = {
          top: this.parentEl.offset().top - this.parentEl.scrollTop(),
          left: this.parentEl.offset().left - this.parentEl.scrollLeft()
        };
      }

      if (opens == 'left') {
        container.css({
          top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
          right: $(window).width() - this.element.offset().left - this.element.outerWidth() - parentOffset.left,
          left: 'auto'
        });
        if (container.offset().left < 0) {
          container.css({
            right: 'auto',
            left: 9
          });
        }
      } else {
        container.css({
          top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
          left: this.element.offset().left - parentOffset.left,
          right: 'auto'
        });
        if (container.offset().left + container.outerWidth() > $(window).width()) {
          container.css({
            left: 'auto',
            right: 0
          });
        }
      }
    },
    /*
     format: 'dd/mm/Y',
     infoFormat': 'd/m/Y',
     startDate: '2013-01-01',
     endDate: '2013-12-31'
     period: string
     customPeriod: object
     compare: true,
     comparePeriod: 1, 2 or 3
     compareStartDate: '2013-01-01'
     compareEndDate: '2013-01-01'
     */
    setOptions: function (options, _callback) {
      format = 'Y-mm-dd';
      infoFormat = 'LL';
      opens = 'right';

      if (typeof _callback === 'function')
        callback = _callback;

      if (typeof options.format === 'string')
        format = options.format;

      if (typeof options.periods === 'object' && options.periods.length > 0){
        options.periods.forEach(function(period){
          addPeriod(period);
        });
      }

      if (typeof options.opens === 'string')
        opens = options.opens;

//      if (typeof options.activePeriods === 'object' && options.activePeriods.length > 0){
//        defaultPeriod = options.activePeriods[0];
//        activatePeriods(options.activePeriods);
//      }

      if (typeof options.defaultPeriod === 'string')
        defaultPeriod = options.defaultPeriod;

      if (typeof options.infoFormat === 'string')
        infoFormat = options.infoFormat;

      if (typeof options.startDate === 'string')
        startDateElt.val(options.startDate);

      if (typeof options.endDate === 'string')
        endDateElt.val(options.endDate);

      if (typeof options.compare === 'boolean' && options.compare){
        compareElt.prop('checked', true);
        container.find('#form-date-body-compare').show();
      }

      if (typeof options.comparePeriod === 'string'){
        if (options.comparePeriod == 'previous')
          compareOptions.val(1);
        else if (options.comparePeriod == 'previousYear')
          compareOptions.val(2);
        else if (options.comparePeriod == 'custom')
          compareOptions.val(3);
        else
          compareOptions.val(1);
      }

      if (typeof options.compareStartDate === 'string'){
        startDateCompareElt.val(options.compareStartDate);
        compareOptions.val(3);
      }

      if (typeof options.compareEndDate === 'string'){
        endDateCompareElt.val(options.compareEndDate);
        compareOptions.val(3);
      }

    },

    remove: function () {
      container.remove();
      this.element.off('.daterangepicker');
      this.element.removeData('daterangepicker');
    }

  };

  $.fn.daterangepicker = function (options, cb) {
    this.each(function () {
      var el = $(this);
      if (el.data('daterangepicker'))
        el.data('daterangepicker').remove();
      el.data('daterangepicker', new DateRangePicker(el, options, cb));
    });
    return this;
  };

}));
