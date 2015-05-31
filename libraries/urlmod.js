/**
 * URL manipultion functions
 */
var url = require('url');

/**
 * Convert and correct relative to absolute path
 * @param {string} pageURL - pagination page: http://sub.foo.com/cat/1/
 * @param {string} [inurl] - relative or absolute URL: http://sub.foo.com/advert123.html or ../cat/advert123.html
 * @return string - modified URL
 */
module.exports.toAbsolute = function (pageURL, inurl) {

  var outurl;

  //if url is relative path
  if (inurl.indexOf('http') === -1) {
    outurl = url.resolve(pageURL, inurl);
  } else {
    outurl = inurl;
  }

  return outurl;
};



/**
 * Encode parameter in URI:  /some string with empty spaces čćžšđ/ -> /some-string-with-empty-spaces-čćžšđ/
 * @param {string} q -parameter
 * @return {string} converted parameter
 *
 */
module.exports.encodeParameter = function (q) {
  var q2 = q.replace(' ', '-');
  q2 = encodeURI(q2);
  return q2;
};


/**
 * Unencode parameter in URI: /some-string-with-empty-spaces-čćžšđ/ -> /some string with empty spaces čćžšđ/
 * @param {string} q -parameter
 * @return {string} converted parameter
 *
 */
module.exports.unencodeParameter = function (q) {
  q2 = encodeURI(q);
  var q3 = q2.replace('-', ' ');
  return q3;
};