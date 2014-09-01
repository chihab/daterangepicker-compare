Date.parseDate = function (date, format) {
  if (format === undefined)
    format = 'Y-mm-dd';
  return new Date(moment(date, format).valueOf());
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
  return moment(this).format(format);
};