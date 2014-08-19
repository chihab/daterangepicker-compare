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
  var compareElt = null;
  var format = null;

  var DRP = function (element, options, cb) {
    //element that triggered the date range picker
    this.element = $(element);

    var DRPTemplate = '<div class="datepicker dropdown-menu opensleft show-calendar" style="left: auto; display: block;">'+
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
                            '<div class="datepicker_start_input">'+
                              '<label for="datepicker_start">From</label>'+
                              '<input class="date-input input-mini" type="text" id="date-start-compare" name="datepicker_start" />'+
                            '</div>'+
                            '<div class="datepicker_end_input">'+
                              '<label for="datepicker_end">To</label>'+
                              '<input class="date-input input-mini" type="text" id="date-end-compare" name="datepicker_end" />'+
                            '</div>'+
                            '<div class="datepicker_buttons">'+
                              '<button class="applyBt btn btn-small btn-sm btn-success">Apply</button>&nbsp;'+
                              '<button class="cancelBt btn btn-small btn-sm btn-default">Cancel</button>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                      '</div>';

    if (typeof options !== 'object' || options === null)
      options = {};

    this.container = $(DRPTemplate).appendTo(this.element);

    startDateElt = this.container.find('#date-start');
    endDateElt = this.container.find('#date-end');
    startDateCompareElt = this.container.find('#date-start-compare');
    endDateCompareElt = this.container.find('#date-end-compare');
    compareElt = this.container.find('#datepicker-compare');
    startDateInfo = this.container.find('#datepicker-from-info');
    endDateInfo = this.container.find('#datepicker-to-info');

    this.setOptions(options, cb);

    datePickerStart = this.container.find('#datepicker1').calendar({
      "dates": translated_dates,
      "weekStart": 1,
      "start": startDateElt.val(),
      "end": endDateElt.val(),
      "format": format
    }).on('changeDate', function (ev) {
      if (ev.date.valueOf() >= datePickerEnd.viewDate.valueOf()) {
        datePickerEnd.setValue(ev.date.setMonth(ev.date.getMonth() + 1));
      }
    }).on('mouseenter', function () {
      datePickerEnd.fillMonthStart();
    }).on('pickerChange', $.proxy(this.datePickerStartChange, this))
      .data('calendar');

    datePickerEnd = this.container.find('#datepicker2').calendar({
      "dates": translated_dates,
      "weekStart": 1,
      "start": startDateElt.val(),
      "end": endDateElt.val(),
      "format": format
    }).on('changeDate', function (ev) {
      if (ev.date.valueOf() <= datePickerStart.viewDate.valueOf()) {
        datePickerStart.setValue(ev.date.setMonth(ev.date.getMonth() - 1));
      }
    }).on('mouseenter', function () {
        datePickerStart.fillMonthEnd();
    }).on('pickerChange', $.proxy(this.datePickerEndChange, this))
      .data('calendar');

    //Set first date picker to month -1 if same month
    var startDate = this.start();
    var endDate = this.end();

    if (startDate.getFullYear() == endDate.getFullYear() && startDate.getMonth() == endDate.getMonth())
      datePickerStart.setValue(startDate.subMonths(1));

    //Events binding
    startDateElt.on('change', $.proxy(this.startDateChange, this));
    endDateElt.on('change', $.proxy(this.endDateChange, this));
    startDateCompareElt.on('change', $.proxy(this.startDateCompareChange, this));
    endDateCompareElt.on('change', $.proxy(this.endDateCompareChange, this));
    compareElt.on('click', $.proxy(this.compareClick, this));

    this.container.find('#range').on('change', $.proxy(this.setPeriod, this));
    this.container.find('#compare-options').on('change', $.proxy(this.compareOptionsChange, this));

    //TODO Review this.
    this.container.find('#datepicker-cancel').click(function () {
      $('#datepicker').addClass('hide');
    });
    this.container.find('#datepicker').show(function () {
      startDateElt.focus();
    });

    startDateElt.focus(function () {
      datePickerStart.setCompare(false);
      datePickerEnd.setCompare(false);
      $(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    endDateElt.focus(function () {
      datePickerStart.setCompare(false);
      datePickerEnd.setCompare(false);
      $(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    startDateCompareElt.focus(function () {
      datePickerStart.setCompare(true);
      datePickerEnd.setCompare(true);
      $('#compare-options').val(3);
      $(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    endDateCompareElt.focus(function () {
      datePickerStart.setCompare(true);
      datePickerEnd.setCompare(true);
      $('#compare-options').val(3);
      $(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    if (compareElt.is(':checked')) {
      if (startDateCompareElt.val().replace(/^\s+|\s+$/g, '').length == 0)
        $('#compare-options').trigger('change');

      datePickerStart.setStartCompare(startDateCompareElt.val());
      datePickerStart.setEndCompare(endDateCompareElt.val());
      datePickerEnd.setStartCompare(startDateCompareElt.val());
      datePickerEnd.setEndCompare(endDateCompareElt.val());
      datePickerStart.setCompare(true);
      datePickerEnd.setCompare(true);
    }

    $('#datepickerExpand').on('click', function () {
      if ($('#datepicker').hasClass('hide')) {
        $('#datepicker').removeClass('hide');
        startDateElt.focus();
      }
      else
        $('#datepicker').addClass('hide');
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
          this.updateCompareRange();
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

    startDateChange: function (event) {
      this.updatePickerFromInput();
      this.notify();
    },

    endDateChange: function (event) {
      this.updatePickerFromInput();
      this.notify();
    },

    startDateCompareChange: function (event) {
      this.updatePickerFromInput();
      this.notify();
    },

    endDateCompareChange: function (event) {
      this.updatePickerFromInput();
      this.notify();
    },

    compareOptionsChange: function (event) {
      this.updateCompareRange();
      if (event.target.value == 3)
        startDateCompareElt.focus();
    },

    compareClick: function (event) {
      if (compareElt.is(':checked')) {
        $('#compare-options').trigger('change');
        $('#form-date-body-compare').show();
        $('#compare-options').prop('disabled', false);
      } else {
        datePickerStart.setStartCompare(null);
        datePickerStart.setEndCompare(null);
        datePickerEnd.setStartCompare(null);
        datePickerEnd.setEndCompare(null);
        $('#form-date-body-compare').hide();
        $('#compare-options').prop('disabled', true);
        startDateElt.focus();
        this.notify();
      }
    },

    updateCompareRange: function () {
      if (compareElt.is(':checked')) {
        var compare = true;
        if ($('#compare-options').val() == 1) {
          compare = false;
          this.setComparePreviousPeriod();
        }

        if ($('#compare-options').val() == 2) {
          compare = false;
          this.setComparePreviousPeriod();
        }
        datePickerStart.setStartCompare(startDateCompareElt.val());
        datePickerStart.setEndCompare(endDateCompareElt.val());
        datePickerEnd.setStartCompare(startDateCompareElt.val());
        datePickerEnd.setEndCompare(endDateCompareElt.val());
        datePickerStart.setCompare(compare);
        datePickerEnd.setCompare(compare);
      }
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
      this.updatePickerFromInput();
      this.compareClick();
    },

    updatePickerFromInput: function () {
      datePickerStart.setStart(startDateElt.val());
      datePickerStart.setEnd(endDateElt.val());
      datePickerEnd.setStart(startDateElt.val());
      datePickerEnd.setValue(Date.parseDate(endDateElt.val(), format).setDate(1));
      datePickerStart.setValue(datePickerStart.date.setFullYear(datePickerEnd.date.getFullYear(), datePickerEnd.date.getMonth() - 1, 1));
      datePickerStart.updateRange();
      datePickerEnd.updateRange();
      this.updateCompareRange();
    },

    setPeriod: function(event) {
      switch(event.target.value){
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
      }
    },

    setDayPeriod: function () {
      var date = new Date();
      startDateElt.val(date.format(format));
      endDateElt.val(date.format(format));

      this.updatePickerFromInput();
      startDateInfo.html(startDateElt.val());
      endDateInfo.html(endDateElt.val());
      this.container.find('#preselectDateRange').val('day');
      this.notify();
    },

    setPreviousDayPeriod: function () {
      var date = new Date();
      date = date.subDays(1);
      startDateElt.val(date.format(format));
      endDateElt.val(date.format(format));
      this.notify();
      this.updatePickerFromInput();
      startDateInfo.html(startDateElt.val());
      endDateInfo.html(endDateElt.val());
      this.container.find('#preselectDateRange').val('prev-day');
    },

    setMonthPeriod: function () {
      var date = new Date().subDays(1);
      endDateElt.val(date.format(format));
      date = date.subDays(30);
      startDateElt.val(date.format(format));
      this.notify();
      this.updatePickerFromInput();
      startDateInfo.html(startDateElt.val());
      endDateInfo.html(endDateElt.val());
      this.container.find('#preselectDateRange').val('month');
    },

    setCurrentMonthPeriod: function () {
      var date = new Date();
      endDateElt.val(date.format(format));
      date = new Date(date.setDate(1));
      startDateElt.val(date.format(format));
      this.notify();
      this.updatePickerFromInput();
      startDateInfo.html(startDateElt.val());
      endDateInfo.html(endDateElt.val());
      this.container.find('#preselectDateRange').val('month');
    },

    setPreviousMonthPeriod: function () {
      var date = new Date();
      date = new Date(date.getFullYear(), date.getMonth(), 0);
      endDateElt.val(date.format(format));
      date = new Date(date.setDate(1));
      startDateElt.val(date.format(format));
      this.notify();
      this.updatePickerFromInput();
      startDateInfo.html(startDateElt.val());
      endDateInfo.html(endDateElt.val());
      this.container.find('#preselectDateRange').val('prev-month');
    },

    setYearPeriod: function () {
      var date = new Date();
      endDateElt.val(date.format(format));
      date = new Date(date.getFullYear(), 0, 1);
      startDateElt.val(date.format(format));
      this.notify();
      this.updatePickerFromInput();
      startDateInfo.html(startDateElt.val());
      endDateInfo.html(endDateElt.val());
      this.container.find('#preselectDateRange').val('year');
    },

    setPreviousYearPeriod: function () {
      var date = new Date();
      date = new Date(date.getFullYear(), 11, 31);
      date = date.subYears(1);
      endDateElt.val(date.format(format));
      date = new Date(date.getFullYear(), 0, 1);
      startDateElt.val(date.format(format));
      this.notify();
      this.updatePickerFromInput();
      startDateInfo.html(startDateElt.val());
      endDateInfo.html(endDateElt.val());
      this.container.find('#preselectDateRange').val('prev-year');
    },

    setComparePreviousPeriod: function () {
      var startDate = Date.parseDate(startDateElt.val(), format).subDays(1);
      var endDate = Date.parseDate(endDateElt.val(), format).subDays(1);

      var diff = endDate - startDate;
      var startDateCompare = new Date(startDate - diff);

      endDateCompareElt.val(startDate.format(format));
      startDateCompareElt.val(startDateCompare.format(format));
      this.notify();
    },

    setComparePreviousYear: function () {
      var startDate = Date.parseDate(startDateElt.val(), format).subYears(1);
      var endDate = Date.parseDate(endDateElt.val(), format).subYears(1);
      startDateCompareElt.val(startDate.format(format));
      endDateCompareElt.val(endDate.format(format));
      this.notify();
    },

    notify: function () {
      if (this.cb)
        this.cb(this.start(), this.end(), this.compareStart(), this.compareEnd(), this.compare());
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

    setOptions: function (options, callback) {
      format = 'Y-mm-dd';
      this.cb = function () {
      };
      if (typeof options.format === 'string')
        format = options.format;

      if (typeof callback === 'function') {
        this.cb = callback;
      }
    },

    remove: function () {
      this.container.remove();
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
