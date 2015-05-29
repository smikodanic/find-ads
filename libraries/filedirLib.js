/**
 * Library for manipulation with files and directories
 */
var fs = require('fs');

/**
 * Show javascript files inside directory
 * @param {string} dirPath - directory path: /homenode/find-ads/tmp/logs/crawler/
 * @return array
 */
module.exports.listJSFiles = function (dirPath) {

  var filedirArr = fs.readdirSync(dirPath);

  //extract only .js files
  var JSfilesArr = filedirArr.filter(function (elem) {
    var reg = new RegExp('\\w.js', 'i');
    return reg.test(elem); //returns true if file contains .js in its name
  });

  return JSfilesArr;
};


/**
 * Show all log files inside directory
 * @param {string} dirPath - directory path: /homenode/find-ads/tmp/logs/crawler/
 * @return rray
 */
module.exports.listLogFiles = function (dirPath) {

  var filedirArr = fs.readdirSync(dirPath);

  //extract only .js files
  var filesArr = filedirArr.filter(function (elem) {
    var reg = new RegExp('\\w.log', 'i');
    return reg.test(elem); //returns true if file contains .log in its name
  });

  //create array of files with its file size
  var filesFullArr = [];
  filesArr.forEach(function (elem) {

    //file stats: size, modified time
    var stats = fs.statSync(dirPath + elem);
    var size = parseInt(stats.size, 10) / 1000; //size in kB
    var mtime = stats.mtime;

    filesFullArr.push({filename: elem, size: size, mtime: mtime});
  });

  return filesFullArr;
};



/**
 * Delete some selected files from directory
 * @param {string} dirPath - directory path: /homenode/find-ads/tmp/logs/crawler/
 * @param {string} ext - file extension to be deleted: '.js' | '.log'
 * @param {array} fileIndexes - array of file indexes: ["0", "2", "5"]
 * @return null
 */
module.exports.delFiles = function (dirPath, ext, fileIndexes) {

  var filedirArr = fs.readdirSync(dirPath);

  //extract only .js files
  var filesArr = filedirArr.filter(function (elem) {
    var reg = new RegExp('\\w' + ext, 'i');
    return reg.test(elem); //returns true if file contains .log in its name
  });


  filesArr.forEach(function (elem, key) {

    key = key.toString();

    if (fileIndexes !== undefined && fileIndexes.indexOf(key) !== -1) {
      fs.unlink(dirPath + elem); //del files async
    }
  });

  return null;
};


/**
 * Delete all files from directory with specific file extension
 * @param {string} dirPath - directory path: /homenode/find-ads/tmp/logs/crawler/
 * @param {string} ext - file extension to be deleted: '.js' | '.log'
 * @return null
 */
module.exports.delAllFiles = function (dirPath, ext) {

  var filedirArr = fs.readdirSync(dirPath);

  //extract only .js files
  var filesArr = filedirArr.filter(function (elem) {
    var reg = new RegExp('\\w' + ext, 'i');
    return reg.test(elem); //returns true if file contains .log in its name
  });


  filesArr.forEach(function (elem) {
    fs.unlink(dirPath + elem); //del files async
  });

  return null;
};


/**
 * Get file content
 * @param {string} filePath - path to the file: /homenode/find-ads/tmp/logs/crawler/20150423something.log
 * @return file content
 */
module.exports.showFile = function (filePath, cbShow) {

  fs.readFile(filePath, cbShow);
};