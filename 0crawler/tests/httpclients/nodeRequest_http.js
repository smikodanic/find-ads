require('rootpath')();
var url = require('url');
var cheerio = require('cheerio');
var logg = require('libraries/loggLib');
var tekstmod = require('libraries/tekstmodLib');
var urlmod = require('libraries/urlmod');

//http module is used
var http = require('http');

/**
 * HTTP client created by NodeJS module - http.request()
 * @param  {object} req      - request object
 * @param  {object} res      - response object
 * @param  {function} cb_render - callback function for displaying results in browser or console
 * @return {object}               null
 */
module.exports.extractData = function (req, res, cb_render) {

  //input vars
  var pageURL = req.body.pageURL;
  var data_type = req.body.data_type;
  var css_selector = req.body.css_selector;

  //url object
  var url_obj = url.parse(pageURL);

  //HTTP client options
  var options = {
    hostname: url_obj.host,
    port: 80,
    path: url_obj.path,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:36.0) Gecko/20100101 Firefox/36.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      // 'Accept-Encoding': 'gzip, deflate'
    }
  };


  // HTTP request using NodeJS 'http' module (http.request)
  var req2 = http.request(options, function (res2) {
      if (res2.statusCode !== 200) { cb_render(req, res, 'ERROR: Response not 200: ' + pageURL + '; Response is:' + res2.statusCode); }

      //get htmlDoc from chunks of data
      var htmlDoc = '';
      res2.on('data', function (chunk) {
        htmlDoc += chunk;
      });

      res2.on('end', function () {

        $ = cheerio.load(htmlDoc);

        // extract data from pageURL using CSS selectors: text, html, image or URL
        var extractedData;
        if (data_type === 'text') {
          extractedData = $(css_selector).text();
        } else if (data_type === 'html') {
          extractedData = $(css_selector).html();
        } else if (data_type === 'href') {
          extractedData = $(css_selector).attr('href');
        } else if (data_type === 'src') {
          extractedData = $(css_selector).attr('src');
        } else { //data_type === 'attr'
          var css_selector_arr = css_selector.split(',');
          extractedData = $(css_selector_arr[0].trim()).attr(css_selector_arr[1].trim());
        }

        cb_render(req, res, 'Status:' + res2.statusCode + '\n\nExtracted Data:\n' + extractedData);
      });

    });


  req2.on('error', function (err) {
    cb_render(req, res, 'http.request error: ' + err + ' pageURL:' + pageURL);
  });

  req2.end();


};