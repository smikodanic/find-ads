var tekstmod = require('libraries/tekstmodLib');
var urlmod = require('libraries/urlmod');
var timeLib = require('libraries/timeLib');
var lc_model = require('models/robotLinksContent_model'); //link-content model
var logg = require('libraries/loggLib');

/**
 * Extract links from pageURL and inserting into 'robot_linkqueue_*'
 * @param  {object} $ -cheerio object
 */
module.exports.extractLinks = function ($, pageURL, moTask, moLink, cb_outResults) {
  /**
   * Extract links from pageURL and insert into robot_linkqueu_*
   */
  var n = 1, href, tekst;
  $('a').each(function () {
    // tekst = $(this).children().remove().end().text(); //get text from A tag without children tag texts
    tekst = $(this).text();
    href = $(this).attr('href');

    //prettify tekst
    tekst = tekstmod.strongtrim(tekst);

    //correct url (relative convert to absolute)
    href = urlmod.toAbsolute(pageURL, href);

    //doc to be inserted into robot_linkqueue_*
    var insLinkqueueDoc = {
      "lid": 0,
      "task_collection": "robot_tasks",
      "task_id": moTask.id,
      "referer": pageURL,
      "crawlTime": timeLib.nowLocale(),
      "link": {
        "tekst": tekst,
        "href": href
      },
      "crawlStatus" : "pending",
      "crawlDepth" : moLink.crawlDepth + 1
    };

    //***** insert into 'robot_linkqueue_*'
    lc_model.insertNewLink(moTask.linkqueueCollection, insLinkqueueDoc);


    //message hrefs
    var msg_href = '----- ' + n + '. ' + href + ' --- ' + tekst;
    // logg.craw(false, moTask.loggFileName, msg_href); //log to file
    cb_outResults.send(msg_href  + '\n');

    n++;
  });

  //message number of extracted links
  n = n - 1;
  var msg_num = '-------- Extracted links: ' + n;
  cb_outResults.send(msg_num + '\n\n'); //send to browser
  // logg.craw(false, moTask.loggFileName, msg_num); //log to file

}; //extractLinks end




/**
 * Extract content from pageURL
 * @param  {object} $ -cheerio object
 */
module.exports.extractContent = function ($, pageURL, moTask, cb_outResults) {

  /* doc skeleton to be inserted into mongoDB */
  var insMoDoc = {
    "cid": undefined,
    "pageURL": pageURL,
    "crawlDateTime": timeLib.nowLocale(),
    "category": parseInt(moTask.category, 10),
    "subcategory": parseInt(moTask.subcategory, 10),
    "extract": {} //will be an object
  };

  var extractedData;
  moTask.selectors.forEach(function (cssSel) { //iterate through CSS selectors defined in 'robot_tasks'

    // extract data from pageURL using CSS selectors: text, html, image or URL
    // cssSel.value is CSS selector from MongoDB 'contentTask' collection
    if (cssSel.type === 'text') {
      extractedData = $(cssSel.value).text();
    } else if (cssSel.type === 'html') {
      extractedData = $(cssSel.value).html();
    } else if (cssSel.type === 'href') {
      extractedData = $(cssSel.value).attr('href');
    } else if (cssSel.type === 'src') {
      extractedData = $(cssSel.value).attr('src');
    } else { //cssSel.tyle === 'attr'
      extractedData = $(cssSel.value[0]).attr(cssSel.value[1]);
    }

    //prettify tekst
    extractedData = tekstmod.strongtrim(extractedData);

    //fill extracted data into 'extract' property: extract.title[1] gives web page title
    insMoDoc.extract[cssSel.name] = [cssSel.type, cssSel.value, extractedData];

    //messaging extracted data
    var msg_extracted = '-----  ' + cssSel.name + ': ' + extractedData;
    cb_outResults.send(msg_extracted + '\n');
    logg.craw(false, moTask.loggFileName, msg_extracted);

  }); //forEach end

};//extractContent end