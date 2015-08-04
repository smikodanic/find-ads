/**
 * get and set data from two collection when robot goes into crawling
 * 1. robot_linkqueue_*
 * 2. robot_content
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');

//mongo parameters
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;


/**
 * Insert new link into 'robot_linkqueue_*'
 * @param {string} linkqueueCollection -- collection name: 'robot_linkqueue_*'
 * @param {object} insLinkqueueDoc -- doc to be inserted - contains new link href
 * 
 */
module.exports.insertNewLink = function (linkqueueCollection, insLinkqueueDoc) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':25 ' + err); }

    db.collection(linkqueueCollection).find({"link.href": insLinkqueueDoc.link.href}).toArray(function (err, moLink_arr) { //check if link already exists
      if (err) { logg.byWinston('error', __filename + ':28 ' + err); }

      var moLink = moLink_arr[0];

      if (moLink === undefined) {//if link doesn't exist in database

        db.collection(linkqueueCollection).insert(insLinkqueueDoc, function (err) { //insert new link into robot_linkqueue_*
          if (err) { logg.byWinston('error', __filename + ':31 ' + err); }
          db.close();
        });
      } else { //if link already exist in databse

        logg.craw(false, 'robot_linkExists', 'Link already exists in DB ' + linkqueueCollection + ': ' + insLinkqueueDoc.link.href);
        db.close();
      }

    });

  });

};


/**
 * Update crawlStatus from 'pending' into 'crawled' or 'error'
 * @param {string} linkqueueCollection -- collection name: 'robot_linkqueue_*'
 * @param {string} linkHref -- link.href property: 'http://old.adsuu.com/something/file.php'
 * @param  {[type]} crawlStatus         [description]
 */
module.exports.updateCrawlStatus = function (linkqueueCollection, linkHref, crawlStatus) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':25 ' + err); }

    db.collection(linkqueueCollection).update({"link.href": linkHref}, {$set: {"crawlStatus": crawlStatus}}, function (err) {
      if (err) { logg.byWinston('error', __filename + ':65 ' + err); }

      db.close();
    });

  });

};
