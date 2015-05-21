/**
 * Usage of getElementsInfo() method
 */

var utils = require('utils');
var casper = require('casper').create({
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
  }
});

casper.start('http://en.wikipedia.org/wiki/List_of_towns_in_Vermont', function () {
  this.echo(this.getTitle());

  // Get info on all elements matching this CSS selector
  var town_selector = 'table[class="sortable wikitable jquery-tablesorter"] tbody tr td:nth-of-type(2)';
  var town_names_info = this.getElementsInfo(town_selector); // an array of object literals

  // Pull out the town name text and push into the town_names array
  var town_names = [];
  var i;
  for (i = 0; i < town_names_info.length; i++) {
    town_names.push(town_names_info[i].text);
  }

  // Dump the town_names array to screen
  utils.dump(town_names);
});

casper.run();