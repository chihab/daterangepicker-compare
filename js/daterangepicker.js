(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'exports'], function ($, exports) {
      root.drp = factory(root, exports, $);
    });

  } else if (typeof exports !== 'undefined') {
    factory(root, exports);

    // Finally, as a browser global.
  } else {
    root.drp = factory(root, {}, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function (root, drp, $) {
  var datePickerStart = null, datePickerEnd = null;
  var startDateElt = null, endDateElt = null, startDateCompareElt = null, endDateCompareElt = null;
  var startDateInfo = null, endDateInfo = null;
  var periodElt = null;
  var compareElt = null, compareOptions = null;
  var infoFormat = null, format = null;
  var container = null;
  var callback = null;

  var DRP = function (element, options, cb) {
    this.element = $(element);

    var DRPTemplate = '<div class="form-group pull-right">'+
                        '<button id="datepickerExpand" class="btn btn-default" type="button">' +
                          '<span class="hidden-xs"> ' +
                            '<strong class="text-info" id="datepicker-from-info"></strong>' +
                            ' - '+
                            '<strong class="text-info" id="datepicker-to-info"></strong>' +
                            '<strong class="text-info" id="datepicker-diff-info"></strong>' +
                          '</span>'+
                          '&nbsp;<i class="fa fa-caret-down"></i></button>'+
                      '</div>'+
                      '<div class="datepicker dropdown-menu opensleft show-calendar" style="display: block;">'+
                          '<div id="datepicker1" class="calendar left" data-date=""></div>'+
                          '<div id="datepicker2" class="calendar right" data-date=""></div>'+
                          '<div class="ranges">'+
                            '<select id="range" class="form-control fixed-width-lg pull-right">'+
                              '<option value="day">'+
                                'Day'+
                              '</option>'+
                              '<option value="month">'+
                                'Month'+
                              '</option>'+
                              '<option value="monthCur">'+
                                'Current Month'+
                              '</option>'+
                              '<option value="year">'+
                                'Year'+
                              '</option>'+
                              '<option value="dayPrev">'+
                                'Day-1'+
                              '</option>'+
                              '<option value="monthPrev">'+
                                'Month-1'+
                              '</option>'+
                              '<option value="yearPrev">'+
                                'Year-1'+
                              '</option>'+
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
                                '<select id="compare-options" class="form-control fixed-width-lg pull-right" name="compare_date_option">'+
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

    container = $(DRPTemplate).appendTo(this.element);

    startDateElt = container.find('#date-start');
    endDateElt = container.find('#date-end');
    startDateCompareElt = container.find('#date-start-compare');
    endDateCompareElt = container.find('#date-end-compare');
    compareElt = container.find('#datepicker-compare');
    compareOptions = container.find('#compare-options');
    startDateInfo = container.find('#datepicker-from-info');
    endDateInfo = container.find('#datepicker-to-info');
    periodElt = container.find('#range');

    this.setOptions(options, cb);

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

    periodElt.on('change', $.proxy(this.setPeriod, this));

    if (startDateElt.val() != '')
      this.dateChange();
    else
      periodElt.trigger('change');

    container.find('#datepicker-cancel').click(function () {
      container.find('#datepicker').addClass('hide');
    });

    container.find('#datepicker').show(function () {
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
//
//    if (compareElt.is(':checked')) {
//      if (startDateCompareElt.val().replace(/^\s+|\s+$/g, '').length == 0)
//        compareOptions.trigger('change');
//
//      datePickerStart.setStartCompare(startDateCompareElt.val());
//      datePickerStart.setEndCompare(endDateCompareElt.val());
//      datePickerEnd.setStartCompare(startDateCompareElt.val());
//      datePickerEnd.setEndCompare(endDateCompareElt.val());
//      datePickerStart.setCompare(true);
//      datePickerEnd.setCompare(true);
//    }

    container.find('#datepickerExpand').on('click', function () {
      if (container.find('.datepicker').hasClass('hide')) {
        container.find('.datepicker').removeClass('hide');
        startDateElt.focus();
      }
      else
        container.find('.datepicker').addClass('hide');
    });
  };

  DRP.prototype = {
    constructor: DRP,

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
        container.find('#form-date-body-compare').show();
        compareOptions.prop('disabled', false);
      } else {
        datePickerStart.setStartCompare(null);
        datePickerStart.setEndCompare(null);
        datePickerEnd.setStartCompare(null);
        datePickerEnd.setEndCompare(null);
        container.find('#form-date-body-compare').hide();
        compareOptions.prop('disabled', true);
        startDateElt.focus();
      }
    },

    setPeriod: function (event) {
      switch (event.target.value) {
        case 'day':
          this.setDayPeriod();
          break;
        default:
        case 'month':
          this.setMonthPeriod();
          break;
        case 'monthCur':
          this.setCurrentMonthPeriod();
          break;
        case 'year':
          this.setYearPeriod();
          break;
        case 'dayPrev':
          this.setPreviousDayPeriod();
          break;
        case 'monthPrev':
          this.setPreviousMonthPeriod();
          break;
        case 'yearPrev':
          this.setPreviousYearPeriod();
          break;
        case 'monthCur':
          this.setCurrentMonthPeriod();
          break;
        case 'custom':
          this.setCustomPeriod();
          break;
      };
      this.dateChange();
    },

    setDayPeriod: function () {
      var date = new Date();
      startDateElt.val(date.format(format));
      endDateElt.val(date.format(format));
    },

    setPreviousDayPeriod: function () {
      var date = new Date();
      date = date.subDays(1);
      startDateElt.val(date.format(format));
      endDateElt.val(date.format(format));
    },

    setMonthPeriod: function () {
      var date = new Date().subDays(1);
      endDateElt.val(date.format(format));
      date = date.subDays(30);
      startDateElt.val(date.format(format));
    },

    setCurrentMonthPeriod: function () {
      var date = new Date();
      endDateElt.val(date.format(format));
      date = new Date(date.setDate(1));
      startDateElt.val(date.format(format));
    },

    setPreviousMonthPeriod: function () {
      var date = new Date();
      date = new Date(date.getFullYear(), date.getMonth(), 0);
      endDateElt.val(date.format(format));
      date = new Date(date.setDate(1));
      startDateElt.val(date.format(format));
    },

    setYearPeriod: function () {
      var date = new Date();
      endDateElt.val(date.format(format));
      date = new Date(date.getFullYear(), 0, 1);
      startDateElt.val(date.format(format));
    },

    setPreviousYearPeriod: function () {
      var date = new Date();
      date = new Date(date.getFullYear(), 11, 31);
      date = date.subYears(1);
      endDateElt.val(date.format(format));
      date = new Date(date.getFullYear(), 0, 1);
      startDateElt.val(date.format(format));
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
      this.compareClick();
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
      startDateInfo.html(this.start().format(infoFormat));
      endDateInfo.html(this.end().format(infoFormat));
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
      format = infoFormat = 'Y-mm-dd';

      if (typeof _callback === 'function')
        callback = _callback;

      if (typeof options.format === 'string')
        format = options.format;

      if (typeof options.customPeriod == 'object'){
        this.setCustomPeriod = function(){
          startDateElt.val(options.customPeriod.start().format(format));
          endDateElt.val(options.customPeriod.end().format(format));
        };
        periodElt.append($("<option></option>").val('custom').html(options.customPeriod.name));
      }

      if (typeof options.period === 'string')
        periodElt.val(options.period);
      else
        periodElt.val('monthCur');

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
      this.element.off('.drp');
      this.element.removeData('drp');
    }

  };

  $.fn.drp = function (options, cb) {
    this.each(function () {
      var el = $(this);
      if (el.data('drp'))
        el.data('drp').remove();
      el.data('drp', new DRP(el, options, cb));
    });
    return this;
  };

}));
