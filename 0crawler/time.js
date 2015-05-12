/**
 * Time library for getting, and converting time format.
 */

/**
 * get current date in format: Tue May 12 2015 16:58:26 GMT+0200 (CEST)
 */
module.exports.nowLocale = function () {
  var d = new Date();
  return d.toLocaleString();
};