/**
 * Time library for getting, and converting time format.
 */

module.exports.nowLocale = function () {
  var d = new Date();
  return d.toLocaleString();
};