/**
 * Time library for getting, and converting time format.
 */

// Wed May 27 2015 14:33:14 GMT+0200 (CEST)
module.exports.nowLocale = function () {
  var d = new Date();
  return d.toLocaleString();
};

// 2012-06-22 05:40:06
module.exports.nowSQL = function () {
  var date = new Date();
  var hours = date.getUTCHours();
  date.setUTCHours(hours + 2); // +2 hours for CEST (Central European Savelight Time)

  var d = date.toISOString().slice(0, 19).replace('T', ' ');
  return d;
};