/**
 * String and text manipultion functions
 */

/**
 * Trim empty spaces from left and right and remove tab spaces inside text
 * @param string str - string to be modified
 * @return string - modified string is returned
 */
module.exports.strongtrim = function (str) {

  if (str !== undefined) {

    str = str.trim();
    str = str.replace(/\t/g, ' ');
    str = str.replace(/\s\s+/g, ' ')
    str = str.replace(/\n/g, '');
    str = str.replace(/\r/g, '');

  } else {
    str = null;
  }

  return str;
};


/**
 * Clear text from unwanted characters
 * @param string str - string to be modified
 * @return string - modified string is returned
 */
module.exports.beautifyText = function (str) {

  if (str !== undefined) {

    str = str.replace(/\_/g, ' ');
    str = str.replace(/\:/g, '');
    str = str.replace(/\./g, '');

  } else {

    str = null;
  }

  return str;
};


