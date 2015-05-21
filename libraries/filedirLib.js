/**
 * Library for manipulation with files and directories
 */
var fs = require('fs');

/**
 * Show files inside directory
 * @param {string} pageURL - pagination page: http://sub.foo.com/cat/1/
 * @param {string} [inurl] - relative or absolute URL: http://sub.foo.com/advert123.html or ../cat/advert123.html
 * @return string - modified URL
 */
module.exports.listFiles = function (dirPath) {

  var filedirArr = fs.readdirSync(dirPath);

  //extract only .js files
  var JSfilesArr = filedirArr.filter(function (elem) {
    return /.*\.js/.test(elem); //returns true if file contains .js in its name
  });

  return JSfilesArr;
};