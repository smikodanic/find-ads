/**
 * String and text manipultion functions
 */

/**
 * Trim empty spaces from left and right and remove tab spaces inside text
 * @param string str - string to be modified
 * @return string - modified string is returned
 */
module.exports.strongtrim = function (str) {
  str = str.trim();
  str = str.replace("\t", " ");
  return str;
};