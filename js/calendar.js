var datePickerStart = null, datePickerEnd = null;

Date.parseDate = function (date, format) {
  if (format === undefined)
    format = 'Y-mm-dd';

  var formatSeparator = format.match(/[.\/\-\s].*?/);
  var formatParts = format.split(/\W+/);
  var parts = date.split(formatSeparator);
  var tmpDate = new Date();

  if (parts.length === formatParts.length) {
    tmpDate.setHours(0);
    tmpDate.setMinutes(0);
    tmpDate.setSeconds(0);
    tmpDate.setMilliseconds(0);

    for (var i = 0; i <= formatParts.length; i++) {
      switch (formatParts[i]) {
        case 'dd':
        case 'd':
        case 'j':
          tmpDate.setDate(parseInt(parts[i], 10) || 1);
          break;

        case 'mm':
        case 'm':
          tmpDate.setMonth((parseInt(parts[i], 10) || 1) - 1);
          break;

        case 'yy':
        case 'y':
          tmpDate.setFullYear(2000 + (parseInt(parts[i], 10) || 1));
          break;

        case 'yyyy':
        case 'Y':
          tmpDate.setFullYear(parseInt(parts[i], 10) || 1);
          break;
      }
    }
  }

  return tmpDate;
};

Date.prototype.subDays = function (value) {
  this.setDate(this.getDate() - value);
  return this;
};

Date.prototype.subMonths = function (value) {
  var date = this.getDate();
  this.setMonth(this.getMonth() - value);
  if (this.getDate() < date) {
    this.setDate(0);
  }
  return this;
};

Date.prototype.subWeeks = function (value) {
  this.subDays(value * 7);
  return this;
};

Date.prototype.subYears = function (value) {
  var month = this.getMonth();
  this.setFullYear(this.getFullYear() - value);
  if (month < this.getMonth()) {
    this.setDate(0);
  }
  return this;
};

Date.prototype.format = function (format) {
  if (format === undefined)
    return this.toString();

  var formatSeparator = format.match(/[.\/\-\s].*?/);
  var formatParts = format.split(/\W+/);
  var result = '';

  for (var i = 0; i <= formatParts.length; i++) {
    switch (formatParts[i]) {
      case 'd':
      case 'j':
        result += this.getDate() + formatSeparator;
        break;

      case 'dd':
        result += (this.getDate() < 10 ? '0' : '') + this.getDate() + formatSeparator;
        break;

      case 'm':
        result += (this.getMonth() + 1) + formatSeparator;
        break;

      case 'mm':
        result += (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1) + formatSeparator;
        break;

      case 'yy':
      case 'y':
        result += this.getFullYear() + formatSeparator;
        break;

      case 'yyyy':
      case 'Y':
        result += this.getFullYear() + formatSeparator;
        break;
    }
  }

  return result.slice(0, -1);
};

function updateCompareRange() {
  if ($('#datepicker-compare').is(':checked')){
    var compare = true;
    if ($('#compare-options').val() == 1){
      compare = false;
      setPreviousPeriod();
    }

    if ($('#compare-options').val() == 2){
      compare = false;
      setPreviousYear();
    }
    datePickerStart.setStartCompare($("#date-start-compare").val());
    datePickerStart.setEndCompare($("#date-end-compare").val());
    datePickerEnd.setStartCompare($("#date-start-compare").val());
    datePickerEnd.setEndCompare($("#date-end-compare").val());
    datePickerStart.setCompare(compare);
    datePickerEnd.setCompare(compare);
  }
}
function updatePickerFromInput() {

  datePickerStart.setStart($("#date-start").val());
  datePickerStart.setEnd($("#date-end").val());
  datePickerEnd.setStart($("#date-start").val());
  datePickerEnd.setValue(Date.parseDate($("#date-end").val()).setDate(1));
  datePickerStart.setValue(datePickerStart.date.setFullYear(datePickerEnd.date.getFullYear(), datePickerEnd.date.getMonth() - 1, 1));
  datePickerStart.updateRange();
  datePickerEnd.updateRange();

  $('#date-start').trigger('change');
  updateCompareRange();
}

function setDayPeriod() {
  var date = new Date();
  $("#date-start").val(date.format($("#date-start").data('date-format')));
  $("#date-end").val(date.format($("#date-end").data('date-format')));
  $('#date-start').trigger('change');

  updatePickerFromInput();
  $('#datepicker-from-info').html($("#date-start").val());
  $('#datepicker-to-info').html($("#date-end").val());
  $('#preselectDateRange').val('day');
}

function setPreviousDayPeriod() {
  var date = new Date();
  date = date.subDays(1);
  $("#date-start").val(date.format($("#date-start").data('date-format')));
  $("#date-end").val(date.format($("#date-end").data('date-format')));
  $('#date-start').trigger('change');

  updatePickerFromInput();
  $('#datepicker-from-info').html($("#date-start").val());
  $('#datepicker-to-info').html($("#date-end").val());
  $('#preselectDateRange').val('prev-day');
}

function setMonthPeriod() {
  var date = new Date();
  $("#date-end").val(date.format($("#date-end").data('date-format')));
  date = new Date(date.setDate(1));
  $("#date-start").val(date.format($("#date-start").data('date-format')));
  $('#date-start').trigger('change');

  updatePickerFromInput();
  $('#datepicker-from-info').html($("#date-start").val());
  $('#datepicker-to-info').html($("#date-end").val());
  $('#preselectDateRange').val('month');
}

function setPreviousMonthPeriod() {
  var date = new Date();
  date = new Date(date.getFullYear(), date.getMonth(), 0);
  $("#date-end").val(date.format($("#date-end").data('date-format')));
  date = new Date(date.setDate(1));
  $("#date-start").val(date.format($("#date-start").data('date-format')));
  $('#date-start').trigger('change');

  updatePickerFromInput();
  $('#datepicker-from-info').html($("#date-start").val());
  $('#datepicker-to-info').html($("#date-end").val());
  $('#preselectDateRange').val('prev-month');
}

function setYearPeriod() {
  var date = new Date();
  $("#date-end").val(date.format($("#date-end").data('date-format')));
  date = new Date(date.getFullYear(), 0, 1);
  $("#date-start").val(date.format($("#date-start").data('date-format')));
  $('#date-start').trigger('change');

  updatePickerFromInput();
  $('#datepicker-from-info').html($("#date-start").val());
  $('#datepicker-to-info').html($("#date-end").val());
  $('#preselectDateRange').val('year');
}

function setPreviousYearPeriod() {
  var date = new Date();
  date = new Date(date.getFullYear(), 11, 31);
  date = date.subYears(1);
  $("#date-end").val(date.format($("#date-end").data('date-format')));
  date = new Date(date.getFullYear(), 0, 1);
  $("#date-start").val(date.format($("#date-start").data('date-format')));
  $('#date-start').trigger('change');

  updatePickerFromInput();
  $('#datepicker-from-info').html($("#date-start").val());
  $('#datepicker-to-info').html($("#date-end").val());
  $('#preselectDateRange').val('prev-year');
}


function setPreviousPeriod() {
  var startDate = Date.parseDate($("#date-start").val(), $("#date-start").data('date-format')).subDays(1);
  var endDate = Date.parseDate($("#date-end").val(), $("#date-end").data('date-format')).subDays(1);

  var diff = endDate - startDate;
  var startDateCompare = new Date(startDate - diff);

  $("#date-end-compare").val(startDate.format($("#date-end-compare").data('date-format')));
  $("#date-start-compare").val(startDateCompare.format($("#date-start-compare").data('date-format')));
}

function setPreviousYear() {
  var startDate = Date.parseDate($("#date-start").val(), $("#date-start").data('date-format')).subYears(1);
  var endDate = Date.parseDate($("#date-end").val(), $("#date-end").data('date-format')).subYears(1);
  $("#date-start-compare").val(startDate.format($("#date-start").data('date-format')));
  $("#date-end-compare").val(endDate.format($("#date-start").data('date-format')));
}


$(document).ready(function () {
  datePickerStart = $('.datepicker1').daterangepicker({
    "dates": translated_dates,
    "weekStart": 1,
    "start": $("#date-start").val(),
    "end": $("#date-end").val()
  }).on('changeDate', function (ev) {
    if (ev.date.valueOf() >= datePickerEnd.date.valueOf()) {
      datePickerEnd.setValue(ev.date.setMonth(ev.date.getMonth() + 1));
    }
  }).data('daterangepicker');

  datePickerEnd = $('.datepicker2').daterangepicker({
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
  var startDate = Date.parseDate($("#date-start").val(), $("#date-start").data('date-format'));
  var endDate = Date.parseDate($("#date-end").val(), $("#date-end").data('date-format'));

  if (startDate.getFullYear() == endDate.getFullYear() && startDate.getMonth() == endDate.getMonth())
    datePickerStart.setValue(startDate.subMonths(1));

  //Events binding
  $("#date-start").focus(function () {
    datePickerStart.setCompare(false);
    datePickerEnd.setCompare(false);
    $(".date-input").removeClass("input-selected");
    $(this).addClass("input-selected");
  });

  $('#date-start').on('change', function (ev) {
    console.log("Date start has changed");
  });

  $('#date-end').on('change', function (ev) {
    updateCompareRange();
  });

  $("#date-end").focus(function () {
    datePickerStart.setCompare(false);
    datePickerEnd.setCompare(false);
    $(".date-input").removeClass("input-selected");
    $(this).addClass("input-selected");
  });

  $("#date-start-compare").focus(function () {
    datePickerStart.setCompare(true);
    datePickerEnd.setCompare(true);
    $('#compare-options').val(3);
    $(".date-input").removeClass("input-selected");
    $(this).addClass("input-selected");
  });

  $("#date-end-compare").focus(function () {
    datePickerStart.setCompare(true);
    datePickerEnd.setCompare(true);
    $('#compare-options').val(3);
    $(".date-input").removeClass("input-selected");
    $(this).addClass("input-selected");
  });

  $('#datepicker-cancel').click(function () {
    $('#datepicker').addClass('hide');
  });

  $('#datepicker').show(function () {
    $('#date-start').focus();
    $('#date-start').trigger('change');
  });

  $('#datepicker-compare').click(function () {
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

  $('#compare-options').change(function () {
    updateCompareRange();

    if (this.value == 3)
      $('#date-start-compare').focus();
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

  $('.submitDateDay').on('click', function (e) {
    e.preventDefault();
    setDayPeriod();
  });
  $('.submitDateMonth').on('click', function (e) {
    e.preventDefault();
    setMonthPeriod()
  });
  $('.submitDateYear').on('click', function (e) {
    e.preventDefault();
    setYearPeriod();
  });
  $('.submitDateDayPrev').on('click', function (e) {
    e.preventDefault();
    setPreviousDayPeriod();
  });
  $('.submitDateMonthPrev').on('click', function (e) {
    e.preventDefault();
    setPreviousMonthPeriod();
  });
  $('.submitDateYearPrev').on('click', function (e) {
    e.preventDefault();
    setPreviousYearPeriod();
  });
});
