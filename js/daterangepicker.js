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
  var compareElt = null;
  var format = null;

  var DRP = function (element, options, cb) {

    // by default, the drp element is placed at the bottom of HTML body
    this.parentEl = 'body';

    //element that triggered the date range picker
    this.element = $(element);

    //create the picker HTML object
    var DRPTemplate = "";
    DRPTemplate += "<div class=\"bootstrap\">";
    DRPTemplate += "    <div id=\"calendar\" class=\"panel\">";
    DRPTemplate += "        <form action=\"\" method=\"post\" id=\"calendar_form\" name=\"calendar_form\" class=\"form-inline\">";
    DRPTemplate += "            <div class=\"btn-group\">";
    DRPTemplate += "                <button type=\"button\" name=\"submitDateDay\" class=\"btn btn-default submitDateDay\">";
    DRPTemplate += "                    Day";
    DRPTemplate += "                <\/button>";
    DRPTemplate += "                <button type=\"button\" name=\"submitDateMonth\" class=\"btn btn-default submitDateMonth\">";
    DRPTemplate += "                    Month";
    DRPTemplate += "                <\/button>";
    DRPTemplate += "                <button type=\"button\" name=\"submitDateYear\" class=\"btn btn-default submitDateYear\">";
    DRPTemplate += "                    Year";
    DRPTemplate += "                <\/button>";
    DRPTemplate += "                <button type=\"button\" name=\"submitDateDayPrev\" class=\"btn btn-default submitDateDayPrev\">";
    DRPTemplate += "                    Day-1";
    DRPTemplate += "                <\/button>";
    DRPTemplate += "                <button type=\"button\" name=\"submitDateMonthPrev\" class=\"btn btn-default submitDateMonthPrev\">";
    DRPTemplate += "                    Month-1";
    DRPTemplate += "                <\/button>";
    DRPTemplate += "                <button type=\"button\" name=\"submitDateYearPrev\" class=\"btn btn-default submitDateYearPrev\">";
    DRPTemplate += "                    Year-1";
    DRPTemplate += "                <\/button>";
    DRPTemplate += "            <\/div>";
    DRPTemplate += "            <div class=\"form-group pull-right\">";
    DRPTemplate += "                <button id=\"datepickerExpand\" class=\"btn btn-default\" type=\"button\">";
    DRPTemplate += "                    <i class=\"fa fa-calendar-empty\"><\/i>";
    DRPTemplate += "							<span class=\"hidden-xs\">";
    DRPTemplate += "								From";
    DRPTemplate += "                                <strong class=\"text-info\" id=\"datepicker-from-info\"><\/strong>";
    DRPTemplate += "                                To";
    DRPTemplate += "                                <strong class=\"text-info\" id=\"datepicker-to-info\"><\/strong>";
    DRPTemplate += "								<strong class=\"text-info\" id=\"datepicker-diff-info\"><\/strong>";
    DRPTemplate += "							<\/span>";
    DRPTemplate += "                    <i class=\"fa fa-caret-down\"><\/i>";
    DRPTemplate += "                <\/button>";
    DRPTemplate += "            <\/div>";
    DRPTemplate += "            <div id=\"datepicker\" class=\"row row-padding-top hide\">";
    DRPTemplate += "                <div class=\"col-lg-12\">";
    DRPTemplate += "                    <div class=\"daterangepicker-days\">";
    DRPTemplate += "                        <div class=\"row\">";
    DRPTemplate += "                            <div class=\"col-sm-6 col-lg-4\">";
    DRPTemplate += "                                <div class=\"datepicker1\" data-date=\"\" data-date-format=\"Y-mm-dd\"><\/div>";
    DRPTemplate += "                            <\/div>";
    DRPTemplate += "                            <div class=\"col-sm-6 col-lg-4\">";
    DRPTemplate += "                                <div class=\"datepicker2\" data-date=\"\" data-date-format=\"Y-mm-dd\"><\/div>";
    DRPTemplate += "                            <\/div>";
    DRPTemplate += "                            <div class=\"col-xs-12 col-sm-6 col-lg-4 pull-right\">";
    DRPTemplate += "                                <div id='datepicker-form' class='form-inline'>";
    DRPTemplate += "                                    <div id='date-range' class='form-date-group'>";
    DRPTemplate += "                                        <div class='form-date-heading'>";
    DRPTemplate += "                                            <span class=\"title\">Date range<\/span>";
    DRPTemplate += "                                        <\/div>";
    DRPTemplate += "                                        <div class='form-date-body'>";
    DRPTemplate += "                                            <label>From<\/label>";
    DRPTemplate += "                                            <input class='date-input form-control' id='date-start'";
    DRPTemplate += "                                                   placeholder='Start' type='text' name=\"date_from\" value=\"\"";
    DRPTemplate += "                                                   data-date-format=\"Y-mm-dd\" tabindex=\"1\"\/>";
    DRPTemplate += "                                            <label>to<\/label>";
    DRPTemplate += "                                            <input class='date-input form-control' id='date-end' placeholder='End'";
    DRPTemplate += "                                                   type='text' name=\"date_to\" value=\"\" data-date-format=\"Y-mm-dd\"";
    DRPTemplate += "                                                   tabindex=\"2\"\/>";
    DRPTemplate += "                                        <\/div>";
    DRPTemplate += "                                    <\/div>";
    DRPTemplate += "                                    <div id=\"date-compare\" class='form-date-group'>";
    DRPTemplate += "                                        <div class='form-date-heading'>";
    DRPTemplate += "                                                <span class=\"checkbox-title\">";
    DRPTemplate += "                                                    <label>";
    DRPTemplate += "                                                        <input type='checkbox' id=\"datepicker-compare\"";
    DRPTemplate += "                                                               name=\"datepicker_compare\" tabindex=\"3\">";
    DRPTemplate += "                                                        Compare to";
    DRPTemplate += "                                                    <\/label>";
    DRPTemplate += "                                                <\/span>";
    DRPTemplate += "                                            <select id=\"compare-options\"";
    DRPTemplate += "                                                    class=\"form-control fixed-width-lg pull-right\"";
    DRPTemplate += "                                                    name=\"compare_date_option\">";
    DRPTemplate += "                                                <option value=\"1\" selected=\"selected\"";
    DRPTemplate += "                                                        label=\"Previous period\">Previous period";
    DRPTemplate += "                                                <\/option>";
    DRPTemplate += "                                                <option value=\"2\"";
    DRPTemplate += "                                                        label=\"Previous Year\">Previous year";
    DRPTemplate += "                                                <\/option>";
    DRPTemplate += "                                                <option value=\"3\" label=\"Custom\">Custom<\/option>";
    DRPTemplate += "                                            <\/select>";
    DRPTemplate += "                                        <\/div>";
    DRPTemplate += "                                        <div class=\"form-date-body\" id=\"form-date-body-compare\"";
    DRPTemplate += "                                             style=\"display: none;\">";
    DRPTemplate += "                                            <label>From<\/label>";
    DRPTemplate += "                                            <input id=\"date-start-compare\" class=\"date-input form-control\"";
    DRPTemplate += "                                                   type=\"text\" placeholder=\"Start\" name=\"compare_date_from\" value=\"\"";
    DRPTemplate += "                                                   data-date-format=\"Y-mm-dd\" tabindex=\"4\"\/>";
    DRPTemplate += "                                            <label>to<\/label>";
    DRPTemplate += "                                            <input id=\"date-end-compare\" class=\"date-input form-control\" type=\"text\"";
    DRPTemplate += "                                                   placeholder=\"End\" name=\"compare_date_to\" value=\"\"";
    DRPTemplate += "                                                   data-date-format=\"Y-mm-dd\"";
    DRPTemplate += "                                                   tabindex=\"5\"\/>";
    DRPTemplate += "                                        <\/div>";
    DRPTemplate += "                                    <\/div>";
    DRPTemplate += "                                    <div class='form-date-actions'>";
    DRPTemplate += "                                        <button class='btn btn-link' type='button' id=\"datepicker-cancel\"";
    DRPTemplate += "                                                tabindex=\"7\">";
    DRPTemplate += "                                            <i class='fa-remove'><\/i>";
    DRPTemplate += "                                            Cancel";
    DRPTemplate += "                                        <\/button>";
    DRPTemplate += "                                        <button class='btn btn-default pull-right' type='submit'";
    DRPTemplate += "                                                name=\"submitDateRange\" tabindex=\"6\">";
    DRPTemplate += "                                            <i class='fa-ok text-success'><\/i>";
    DRPTemplate += "                                            Apply";
    DRPTemplate += "                                        <\/button>";
    DRPTemplate += "                                    <\/div>";
    DRPTemplate += "                                <\/div>";
    DRPTemplate += "                            <\/div>";
    DRPTemplate += "                        <\/div>";
    DRPTemplate += "                    <\/div>";
    DRPTemplate += "                <\/div>";
    DRPTemplate += "            <\/div>";
    DRPTemplate += "        <\/form>";
    DRPTemplate += "    <\/div>";
    DRPTemplate += "<\/div>";


    //custom options
    if (typeof options !== 'object' || options === null)
      options = {};

    this.parentEl = (typeof options === 'object' && options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
    this.container = $(DRPTemplate).appendTo(this.parentEl);

    startDateElt = this.container.find('#date-start');
    endDateElt = this.container.find('#date-end');
    startDateCompareElt = this.container.find('#date-start-compare');
    endDateCompareElt = this.container.find('#date-end-compare');
    compareElt = this.container.find('#datepicker-compare');

    this.setOptions(options, cb);

    startDateElt.on('change', $.proxy(this.startDateChange, this));
    endDateElt.on('change', $.proxy(this.endDateChange, this));
    startDateCompareElt.on('change', $.proxy(this.startDateCompareChange, this));
    endDateCompareElt.on('change', $.proxy(this.endDateCompareChange, this));
    compareElt.on('click', $.proxy(this.compareClick, this));


    datePickerStart = this.container.find('.datepicker1').calendar({
      "dates": translated_dates,
      "weekStart": 1,
      "start": startDateElt.val(),
      "end": endDateElt.val()
    }).on('changeDate', function (ev) {
      if (ev.date.valueOf() >= datePickerEnd.viewDate.valueOf()) {
        datePickerEnd.setValue(ev.date.setMonth(ev.date.getMonth() + 1));
      }
    }).on('mouseenter', function () {
      datePickerEnd.fillMonthStart();
    }).on('pickerChange', $.proxy(this.datePickerStartChange, this))
      .data('calendar');

    datePickerEnd = this.container.find('.datepicker2').calendar({
      "dates": translated_dates,
      "weekStart": 1,
      "start": startDateElt.val(),
      "end": endDateElt.val()
    }).on('changeDate', function (ev) {
      if (ev.date.valueOf() <= datePickerStart.viewDate.valueOf()) {
        datePickerStart.setValue(ev.date.setMonth(ev.date.getMonth() - 1));
      }
    }).on('mouseenter', function () {
        datePickerStart.fillMonthEnd();
    }).on('pickerChange', $.proxy(this.datePickerEndChange, this))
      .data('calendar');

    //Set first date picker to month -1 if same month
    var startDate = Date.parseDate(startDateElt.val(), format);
    var endDate = Date.parseDate(endDateElt.val(), format);

    if (startDate.getFullYear() == endDate.getFullYear() && startDate.getMonth() == endDate.getMonth())
      datePickerStart.setValue(startDate.subMonths(1));

    //Events binding
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


    this.container.find('.submitDateDay').on('click', $.proxy(this.setDayPeriod, this));
    this.container.find('.submitDateMonth').on('click', $.proxy(this.setMonthPeriod, this));
    this.container.find('.submitDateYear').on('click', $.proxy(this.setYearPeriod, this));
    this.container.find('.submitDateDayPrev').on('click', $.proxy(this.setPreviousDayPeriod, this));
    this.container.find('.submitDateMonthPrev').on('click', $.proxy(this.setPreviousMonthPeriod, this));
    this.container.find('.submitDateYearPrev').on('click', $.proxy(this.setPreviousYearPeriod, this));
    this.container.find('#compare-options').on('change', $.proxy(this.compareOptionsChange, this));

    this.container.find('#datepicker-cancel').click(function () {
      $('#datepicker').addClass('hide');
    });

    this.container.find('#datepicker').show(function () {
      startDateElt.focus();
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
        if (element === endDateElt)
          this.updateCompareRange();
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
          this.setPreviousPeriod();
        }

        if ($('#compare-options').val() == 2) {
          compare = false;
          this.setPreviousYear();
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
      datePickerEnd.setValue(Date.parseDate(endDateElt.val()).setDate(1));
      datePickerStart.setValue(datePickerStart.date.setFullYear(datePickerEnd.date.getFullYear(), datePickerEnd.date.getMonth() - 1, 1));
      datePickerStart.updateRange();
      datePickerEnd.updateRange();
      this.updateCompareRange();
    },

    setDayPeriod: function () {
      var date = new Date();
      startDateElt.val(date.format(format));
      endDateElt.val(date.format(format));

      this.updatePickerFromInput();
      $('#datepicker-from-info').html(startDateElt.val());
      $('#datepicker-to-info').html(endDateElt.val());
      $('#preselectDateRange').val('day');
      this.notify();
    },

    setPreviousDayPeriod: function () {
      var date = new Date();
      date = date.subDays(1);
      startDateElt.val(date.format(format));
      endDateElt.val(date.format(format));
      this.notify();
      this.updatePickerFromInput();
      $('#datepicker-from-info').html(startDateElt.val());
      $('#datepicker-to-info').html(endDateElt.val());
      $('#preselectDateRange').val('prev-day');
    },

    setMonthPeriod: function () {
      var date = new Date();
      endDateElt.val(date.format(format));
      date = new Date(date.setDate(1));
      startDateElt.val(date.format(format));
      this.notify();
      this.updatePickerFromInput();
      $('#datepicker-from-info').html(startDateElt.val());
      $('#datepicker-to-info').html(endDateElt.val());
      $('#preselectDateRange').val('month');
    },

    setPreviousMonthPeriod: function () {
      var date = new Date();
      date = new Date(date.getFullYear(), date.getMonth(), 0);
      endDateElt.val(date.format(format));
      date = new Date(date.setDate(1));
      startDateElt.val(date.format(format));
      this.notify();
      this.updatePickerFromInput();
      $('#datepicker-from-info').html(startDateElt.val());
      $('#datepicker-to-info').html(endDateElt.val());
      $('#preselectDateRange').val('prev-month');
    },

    setYearPeriod: function () {
      var date = new Date();
      endDateElt.val(date.format(format));
      date = new Date(date.getFullYear(), 0, 1);
      startDateElt.val(date.format(format));
      this.notify();
      this.updatePickerFromInput();
      $('#datepicker-from-info').html(startDateElt.val());
      $('#datepicker-to-info').html(endDateElt.val());
      $('#preselectDateRange').val('year');
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
      $('#datepicker-from-info').html(startDateElt.val());
      $('#datepicker-to-info').html(endDateElt.val());
      $('#preselectDateRange').val('prev-year');
    },

    setPreviousPeriod: function () {
      var startDate = Date.parseDate(startDateElt.val(), format).subDays(1);
      var endDate = Date.parseDate(endDateElt.val(), format).subDays(1);

      var diff = endDate - startDate;
      var startDateCompare = new Date(startDate - diff);

      endDateCompareElt.val(startDate.format(format));
      startDateCompareElt.val(startDateCompare.format(format));
      this.notify();
    },

    setPreviousYear: function () {
      var startDate = Date.parseDate(startDateElt.val(), format).subYears(1);
      var endDate = Date.parseDate(endDateElt.val(), format).subYears(1);
      startDateCompareElt.val(startDate.format(format));
      endDateCompareElt.val(endDate.format(format));
      this.notify();
    },

    notify: function () {
      this.cb(this.getStart(), this.getEnd(), this.getStartCompare(), this.getEndCompare(), this.getCompare());
    },

    getStart: function () {
      return Date.parseDate(startDateElt.val(), format);
    },

    getEnd: function () {
      return Date.parseDate(endDateElt.val(), format);
    },

    getStartCompare: function () {
      return Date.parseDate(startDateCompareElt.val(), format);
    },

    getEndCompare: function () {
      return Date.parseDate(endDateCompareElt.val(), format);
    },

    getCompare: function () {
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
