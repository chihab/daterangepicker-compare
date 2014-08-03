(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'exports'], function($, exports) {
      root.daterangepicker = factory(root, exports, $);
    });

  } else if (typeof exports !== 'undefined') {
    factory(root, exports);

    // Finally, as a browser global.
  } else {
    root.daterangepicker = factory(root, {}, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, daterangepicker, $) {
  var datePickerStart = null, datePickerEnd = null;
  var startDate = null, endDate = null, startDateCompare = null, endDateCompare = null;
  var format = null;

  var DRP = function (element, options, cb) {

    // by default, the daterangepicker element is placed at the bottom of HTML body
    this.parentEl = 'body';

    //element that triggered the date range picker
    this.element = $(element);

    //create the picker HTML object
    var DRPTemplate="";
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

    this.setOptions(options, cb);

    this.container.find('.submitDateDay').on('click', $.proxy(this.setDayPeriod, this));
    this.container.find('.submitDateMonth').on('click', $.proxy(this.setMonthPeriod, this));
    this.container.find('.submitDateYear').on('click', $.proxy(this.setYearPeriod, this));
    this.container.find('.submitDateDayPrev').on('click', $.proxy(this.setPreviousDayPeriod, this));
    this.container.find('.submitDateMonthPrev').on('click', $.proxy(this.setPreviousMonthPeriod, this));
    this.container.find('.submitDateYearPrev').on('click', $.proxy(this.setPreviousYearPeriod, this));
    this.container.find('#date-start').on('change', $.proxy(this.notify, this));
    this.container.find('#date-end').on('change', $.proxy(this.endDateChange, this));
    this.container.find('#compare-options').on('change', $.proxy(this.clickCompare, this));

    datePickerStart = this.container.find('.datepicker1').daterangepicker({
      "dates": translated_dates,
      "weekStart": 1,
      "start": $("#date-start").val(),
      "end": $("#date-end").val()
    }).on('changeDate', function (ev) {
      if (ev.date.valueOf() >= datePickerEnd.date.valueOf()) {
        datePickerEnd.setValue(ev.date.setMonth(ev.date.getMonth() + 1));
      }
    }).data('daterangepicker');

    datePickerEnd = this.container.find('.datepicker2').daterangepicker({
      "dates": translated_dates,
      "weekStart": 1,
      "start": $("#date-start").val(),
      "end": $("#date-end").val()
    }).on('changeDate', function (ev) {
      if (ev.date.valueOf() <= datePickerStart.date.valueOf()) {
        datePickerStart.setValue(ev.date.setMonth(ev.date.getMonth() - 1));
      }
    }).data('daterangepicker');

    //Set first date picker to month -1 if same month
    var startDate = Date.parseDate($("#date-start").val(), format);
    var endDate = Date.parseDate($("#date-end").val(), format);

    if (startDate.getFullYear() == endDate.getFullYear() && startDate.getMonth() == endDate.getMonth())
      datePickerStart.setValue(startDate.subMonths(1));

    //Events binding
    this.container.find("#date-start").focus(function () {
      datePickerStart.setCompare(false);
      datePickerEnd.setCompare(false);
      $(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    this.container.find("#date-end").focus(function () {
      datePickerStart.setCompare(false);
      datePickerEnd.setCompare(false);
      $(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    this.container.find("#date-start-compare").focus(function () {
      datePickerStart.setCompare(true);
      datePickerEnd.setCompare(true);
      $('#compare-options').val(3);
      $(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    this.container.find("#date-end-compare").focus(function () {
      datePickerStart.setCompare(true);
      datePickerEnd.setCompare(true);
      $('#compare-options').val(3);
      $(".date-input").removeClass("input-selected");
      $(this).addClass("input-selected");
    });

    this.container.find('#datepicker-cancel').click(function () {
      $('#datepicker').addClass('hide');
    });

    this.container.find('#datepicker').show(function () {
      $('#date-start').focus();
    });

    this.container.find('#datepicker-compare').click(function () {
      if ($(this).is(':checked')) {
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
        $('#date-start').focus();
      }
    });

    if ($('#datepicker-compare').is(':checked')) {
      if ($("#date-start-compare").val().replace(/^\s+|\s+$/g, '').length == 0)
        $('#compare-options').trigger('change');

      datePickerStart.setStartCompare($("#date-start-compare").val());
      datePickerStart.setEndCompare($("#date-end-compare").val());
      datePickerEnd.setStartCompare($("#date-start-compare").val());
      datePickerEnd.setEndCompare($("#date-end-compare").val());
      datePickerStart.setCompare(true);
      datePickerEnd.setCompare(true);
    }

    $('#datepickerExpand').on('click', function () {
      if ($('#datepicker').hasClass('hide')) {
        $('#datepicker').removeClass('hide');
        $('#date-start').focus();
      }
      else
        $('#datepicker').addClass('hide');
    });
  };

  DRP.prototype = {
    constructor: DRP,

    clickCompare: function(event){
      this.updateCompareRange();
      if (event.target.value == 3)
        $('#date-start-compare').focus();
    },

    endDateChange: function(event){
      this.updateCompareRange();
      this.notify();
    },

    updateCompareRange : function() {
      if ($('#datepicker-compare').is(':checked')){
        var compare = true;
        if ($('#compare-options').val() == 1){
          compare = false;
          this.setPreviousPeriod();
        }

        if ($('#compare-options').val() == 2){
          compare = false;
          this.setPreviousYear();
        }
        datePickerStart.setStartCompare($("#date-start-compare").val());
        datePickerStart.setEndCompare($("#date-end-compare").val());
        datePickerEnd.setStartCompare($("#date-start-compare").val());
        datePickerEnd.setEndCompare($("#date-end-compare").val());
        datePickerStart.setCompare(compare);
        datePickerEnd.setCompare(compare);
      }
    },

    updatePickerFromInput : function() {
      datePickerStart.setStart($("#date-start").val());
      datePickerStart.setEnd($("#date-end").val());
      datePickerEnd.setStart($("#date-start").val());
      datePickerEnd.setValue(Date.parseDate($("#date-end").val()).setDate(1));
      datePickerStart.setValue(datePickerStart.date.setFullYear(datePickerEnd.date.getFullYear(), datePickerEnd.date.getMonth() - 1, 1));
      datePickerStart.updateRange();
      datePickerEnd.updateRange();
      this.updateCompareRange();
    },

    setDayPeriod : function() {
      var date = new Date();
      $("#date-start").val(date.format(format));
      $("#date-end").val(date.format(format));

      this.updatePickerFromInput();
      $('#datepicker-from-info').html($("#date-start").val());
      $('#datepicker-to-info').html($("#date-end").val());
      $('#preselectDateRange').val('day');
      this.notify();
    },

    setPreviousDayPeriod : function() {
      var date = new Date();
      date = date.subDays(1);
      $("#date-start").val(date.format(format));
      $("#date-end").val(date.format(format));

      this.updatePickerFromInput();
      $('#datepicker-from-info').html($("#date-start").val());
      $('#datepicker-to-info').html($("#date-end").val());
      $('#preselectDateRange').val('prev-day');
      this.notify();
    },

    setMonthPeriod : function() {
      var date = new Date();
      $("#date-end").val(date.format(format));
      date = new Date(date.setDate(1));
      $("#date-start").val(date.format(format));

      this.updatePickerFromInput();
      $('#datepicker-from-info').html($("#date-start").val());
      $('#datepicker-to-info').html($("#date-end").val());
      $('#preselectDateRange').val('month');
      this.notify();
    },

    setPreviousMonthPeriod : function() {
      var date = new Date();
      date = new Date(date.getFullYear(), date.getMonth(), 0);
      $("#date-end").val(date.format(format));
      date = new Date(date.setDate(1));
      $("#date-start").val(date.format(format));

      this.updatePickerFromInput();
      $('#datepicker-from-info').html($("#date-start").val());
      $('#datepicker-to-info').html($("#date-end").val());
      $('#preselectDateRange').val('prev-month');
      this.notify();
    },

    setYearPeriod : function() {
      var date = new Date();
      $("#date-end").val(date.format(format));
      date = new Date(date.getFullYear(), 0, 1);
      $("#date-start").val(date.format(format));

      this.updatePickerFromInput();
      $('#datepicker-from-info').html($("#date-start").val());
      $('#datepicker-to-info').html($("#date-end").val());
      $('#preselectDateRange').val('year');
      this.notify();
    },

    setPreviousYearPeriod : function() {
      var date = new Date();
      date = new Date(date.getFullYear(), 11, 31);
      date = date.subYears(1);
      $("#date-end").val(date.format(format));
      date = new Date(date.getFullYear(), 0, 1);
      $("#date-start").val(date.format(format));

      this.updatePickerFromInput();
      $('#datepicker-from-info').html($("#date-start").val());
      $('#datepicker-to-info').html($("#date-end").val());
      $('#preselectDateRange').val('prev-year');
      this.notify();
    },


    setPreviousPeriod : function() {
      var startDate = Date.parseDate($("#date-start").val(), format).subDays(1);
      var endDate = Date.parseDate($("#date-end").val(), format).subDays(1);

      var diff = endDate - startDate;
      var startDateCompare = new Date(startDate - diff);

      $("#date-end-compare").val(startDate.format($("#date-end-compare").data('date-format')));
      $("#date-start-compare").val(startDateCompare.format($("#date-start-compare").data('date-format')));
      this.notify();
    },

    setPreviousYear : function() {
      var startDate = Date.parseDate($("#date-start").val(), format).subYears(1);
      var endDate = Date.parseDate($("#date-end").val(), format).subYears(1);
      $("#date-start-compare").val(startDate.format(format));
      $("#date-end-compare").val(endDate.format(format));
      this.notify();
    },

    notify: function () {
      this.cb(this.getStart(), this.getEnd(), this.getStartCompare(), this.getEndCompare());
    },

    getStart: function (){
      return Date.parseDate(this.container.find("#date-start").val(), format);
    },
    getEnd: function () {
      return Date.parseDate(this.container.find("#date-end").val(), format);
    },
    getStartCompare: function () {
      return Date.parseDate(this.container.find("#date-start-compare").val(), format);
    },
    getEndCompare: function () {
      return Date.parseDate(this.container.find("#date-end-compare").val(), format);
    },

    setOptions: function(options, callback) {
//
//      this.startDate = moment().startOf('day');
//      this.endDate = moment().endOf('day');
//      this.minDate = false;
//      this.maxDate = false;
//      this.dateLimit = false;
//
//      this.showDropdowns = false;
//      this.showWeekNumbers = false;
//      this.timePicker = false;
//      this.timePickerIncrement = 30;
//      this.timePicker12Hour = true;
//      this.singleDatePicker = false;
//      this.ranges = {};
//
//      this.opens = 'right';
//      if (this.element.hasClass('pull-right'))
//        this.opens = 'left';
//
//      this.buttonClasses = ['btn', 'btn-small btn-sm'];
//      this.applyClass = 'btn-success';
//      this.cancelClass = 'btn-default';
//
        format = 'Y-mm-dd';
//      this.separator = ' - ';
//
//      this.locale = {
//        applyLabel: 'Apply',
//        cancelLabel: 'Cancel',
//        fromLabel: 'From',
//        toLabel: 'To',
//        weekLabel: 'W',
//        customRangeLabel: 'Custom Range',
//        daysOfWeek: moment()._lang._weekdaysMin.slice(),
//        monthNames: moment()._lang._monthsShort.slice(),
//        firstDay: moment()._lang._week.dow
//      };

      this.cb = function () { };

      if (typeof options.format === 'string')
        format = options.format;
//
//      if (typeof options.separator === 'string')
//        this.separator = options.separator;
//
//      if (typeof options.startDate === 'string')
//        this.startDate = moment(options.startDate, this.format);
//
//      if (typeof options.endDate === 'string')
//        this.endDate = moment(options.endDate, this.format);
//
//      if (typeof options.minDate === 'string')
//        this.minDate = moment(options.minDate, this.format);
//
//      if (typeof options.maxDate === 'string')
//        this.maxDate = moment(options.maxDate, this.format);
//
//      if (typeof options.startDate === 'object')
//        this.startDate = moment(options.startDate);
//
//      if (typeof options.endDate === 'object')
//        this.endDate = moment(options.endDate);
//
//      if (typeof options.minDate === 'object')
//        this.minDate = moment(options.minDate);
//
//      if (typeof options.maxDate === 'object')
//        this.maxDate = moment(options.maxDate);
//
//      if (typeof options.applyClass === 'string')
//        this.applyClass = options.applyClass;
//
//      if (typeof options.cancelClass === 'string')
//        this.cancelClass = options.cancelClass;
//
//      if (typeof options.dateLimit === 'object')
//        this.dateLimit = options.dateLimit;
//
//      if (typeof options.locale === 'object') {
//
//        if (typeof options.locale.daysOfWeek === 'object') {
//          // Create a copy of daysOfWeek to avoid modification of original
//          // options object for reusability in multiple daterangepicker instances
//          this.locale.daysOfWeek = options.locale.daysOfWeek.slice();
//        }
//
//        if (typeof options.locale.monthNames === 'object') {
//          this.locale.monthNames = options.locale.monthNames.slice();
//        }
//
//        if (typeof options.locale.firstDay === 'number') {
//          this.locale.firstDay = options.locale.firstDay;
//        }
//
//        if (typeof options.locale.applyLabel === 'string') {
//          this.locale.applyLabel = options.locale.applyLabel;
//        }
//
//        if (typeof options.locale.cancelLabel === 'string') {
//          this.locale.cancelLabel = options.locale.cancelLabel;
//        }
//
//        if (typeof options.locale.fromLabel === 'string') {
//          this.locale.fromLabel = options.locale.fromLabel;
//        }
//
//        if (typeof options.locale.toLabel === 'string') {
//          this.locale.toLabel = options.locale.toLabel;
//        }
//
//        if (typeof options.locale.weekLabel === 'string') {
//          this.locale.weekLabel = options.locale.weekLabel;
//        }
//
//        if (typeof options.locale.customRangeLabel === 'string') {
//          this.locale.customRangeLabel = options.locale.customRangeLabel;
//        }
//      }
//
//      if (typeof options.opens === 'string')
//        this.opens = options.opens;
//
//      if (typeof options.showWeekNumbers === 'boolean') {
//        this.showWeekNumbers = options.showWeekNumbers;
//      }
//
//      if (typeof options.buttonClasses === 'string') {
//        this.buttonClasses = [options.buttonClasses];
//      }
//
//      if (typeof options.buttonClasses === 'object') {
//        this.buttonClasses = options.buttonClasses;
//      }
//
//      if (typeof options.showDropdowns === 'boolean') {
//        this.showDropdowns = options.showDropdowns;
//      }
//
//      if (typeof options.singleDatePicker === 'boolean') {
//        this.singleDatePicker = options.singleDatePicker;
//      }
//
//      if (typeof options.timePicker === 'boolean') {
//        this.timePicker = options.timePicker;
//      }
//
//      if (typeof options.timePickerIncrement === 'number') {
//        this.timePickerIncrement = options.timePickerIncrement;
//      }
//
//      if (typeof options.timePicker12Hour === 'boolean') {
//        this.timePicker12Hour = options.timePicker12Hour;
//      }
//
//      // update day names order to firstDay
//      if (this.locale.firstDay != 0) {
//        var iterator = this.locale.firstDay;
//        while (iterator > 0) {
//          this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
//          iterator--;
//        }
//      }
//
//      var start, end, range;
//
//      //if no start/end dates set, check if an input element contains initial values
//      if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
//        if ($(this.element).is('input[type=text]')) {
//          var val = $(this.element).val();
//          var split = val.split(this.separator);
//          start = end = null;
//          if (split.length == 2) {
//            start = moment(split[0], this.format);
//            end = moment(split[1], this.format);
//          } else if (this.singleDatePicker) {
//            start = moment(val, this.format);
//            end = moment(val, this.format);
//          }
//          if (start !== null && end !== null) {
//            this.startDate = start;
//            this.endDate = end;
//          }
//        }
//      }
//
//      if (typeof options.ranges === 'object') {
//        for (range in options.ranges) {
//
//          start = moment(options.ranges[range][0]);
//          end = moment(options.ranges[range][1]);
//
//          // If we have a min/max date set, bound this range
//          // to it, but only if it would otherwise fall
//          // outside of the min/max.
//          if (this.minDate && start.isBefore(this.minDate))
//            start = moment(this.minDate);
//
//          if (this.maxDate && end.isAfter(this.maxDate))
//            end = moment(this.maxDate);
//
//          // If the end of the range is before the minimum (if min is set) OR
//          // the start of the range is after the max (also if set) don't display this
//          // range option.
//          if ((this.minDate && end.isBefore(this.minDate)) || (this.maxDate && start.isAfter(this.maxDate))) {
//            continue;
//          }
//
//          this.ranges[range] = [start, end];
//        }
//
//        var list = '<ul>';
//        for (range in this.ranges) {
//          list += '<li>' + range + '</li>';
//        }
//        list += '<li>' + this.locale.customRangeLabel + '</li>';
//        list += '</ul>';
//        this.container.find('.ranges ul').remove();
//        this.container.find('.ranges').prepend(list);
//      }

      if (typeof callback === 'function') {
        this.cb = callback;
      }

//      if (!this.timePicker) {
//        this.startDate = this.startDate.startOf('day');
//        this.endDate = this.endDate.endOf('day');
//      }
//
//      if (this.singleDatePicker) {
//        this.opens = 'right';
//        this.container.find('.calendar.right').show();
//        this.container.find('.calendar.left').hide();
//        this.container.find('.ranges').hide();
//        if (!this.container.find('.calendar.right').hasClass('single'))
//          this.container.find('.calendar.right').addClass('single');
//      } else {
//        this.container.find('.calendar.right').removeClass('single');
//        this.container.find('.ranges').show();
//      }
//
//      this.oldStartDate = this.startDate.clone();
//      this.oldEndDate = this.endDate.clone();
//      this.oldChosenLabel = this.chosenLabel;
//
//      this.leftCalendar = {
//        month: moment([this.startDate.year(), this.startDate.month(), 1, this.startDate.hour(), this.startDate.minute()]),
//        calendar: []
//      };
//
//      this.rightCalendar = {
//        month: moment([this.endDate.year(), this.endDate.month(), 1, this.endDate.hour(), this.endDate.minute()]),
//        calendar: []
//      };
//
//      if (this.opens == 'right') {
//        //swap calendar positions
//        var left = this.container.find('.calendar.left');
//        var right = this.container.find('.calendar.right');
//        left.removeClass('left').addClass('right');
//        right.removeClass('right').addClass('left');
//      }
//
//      if (typeof options.ranges === 'undefined' && !this.singleDatePicker) {
//        this.container.addClass('show-calendar');
//      }
//
//      this.container.addClass('opens' + this.opens);
//
//      this.updateView();
//      this.updateCalendars();
    },

    remove: function() {
      this.container.remove();
      this.element.off('.daterangepicker');
      this.element.removeData('daterangepicker');
    }

  };

  $.fn.drp = function (options, cb) {
    this.each(function () {
      var el = $(this);
      if (el.data('daterangepicker'))
        el.data('daterangepicker').remove();
      el.data('daterangepicker', new DRP(el, options, cb));
    });
    return this;
  };

}));
