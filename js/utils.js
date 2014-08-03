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