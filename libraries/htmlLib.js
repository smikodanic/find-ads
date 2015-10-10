/**
 * Library for manipulating with HTML code with cheerio
 */
var cheerio = require('cheerio');


/**
 * Extract data from HTML document
 * @param  {string} htmlDoc      - HTML document
 * @param  {string} data_type    - data type: text, html, href, src
 * @param  {string} css_selector 
 * @return {string}              - extracted data
 */
module.exports.extractData = function (htmlDoc, data_type, css_selector) {

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

  return extractedData;
};

