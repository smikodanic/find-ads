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
    if (err) { logg.byWinston('error', __filename + ':73 ' + err); }

    //remove backslash and hash at the end
    if (insLinkqueueDoc.link.href !== undefined) {
      insLinkqueueDoc.link.href = insLinkqueueDoc.link.href.replace(/\/$/, ''); // http://luzz.tv/ -> http://luzz.tv
      insLinkqueueDoc.link.href = insLinkqueueDoc.link.href.replace(/\/\#$/, ''); // http://luzz.tv/# -> http://luzz.tv
    }

    var condition = {"link.href": insLinkqueueDoc.link.href};
    // var condition = {$or: [
    //   {"link.href": insLinkqueueDoc.link.href},
    //   {"link.href": insLinkqueueDoc.link.href + '/'},
    //   {"link.href": insLinkqueueDoc.link.href + '/#'}
    // ]};

    db.collection(linkqueueCollection).find(condition).toArray(function (err, moLink_arr) { //check if link already exists
      if (err) { logg.byWinston('error', __filename + ':25 ' + err); }

      var moLink = moLink_arr[0];

      if (moLink === undefined) {//if link doesn't exist in database

        db.collection(linkqueueCollection).find().sort({lid: -1}).limit(1).toArray(function (err, moMax_arr) { //find max ID
          if (err) { logg.byWinston('error', __filename + ':35 ' + err); }

          //set new insLinkqueueDoc.id from max id value
          if (moMax_arr[0] !== undefined) {
            insLinkqueueDoc.lid = moMax_arr[0].lid + 1;
          } else {
            insLinkqueueDoc.lid = 0;
          }

          //insert link only if it has 'http' . Will not insert: javascript:void()
          if (insLinkqueueDoc.link.href !== undefined && insLinkqueueDoc.link.href.indexOf('http') !== -1) {
            db.collection(linkqueueCollection).insert(insLinkqueueDoc, function (err) { //insert new link into robot_linkqueue_*
              if (err) { logg.byWinston('error', __filename + ':45 ' + err); }
              db.close();
            });
          }


        });

      } else { //if link already exist in databse

        // logg.craw(false, 'robot_linkExists', 'Link already exists in DB ' + linkqueueCollection + ': ' + insLinkqueueDoc.link.href);
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
module.exports.updateCrawlStatus = function (linkqueueCollection, _id, crawlStatus) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':90 ' + err); }

    db.collection(linkqueueCollection).update({"_id": _id}, {$set: {"crawlStatus": crawlStatus}}, function (err) {
      if (err) { logg.byWinston('error', __filename + ':93 ' + err); }

      db.close();
    });

  });

};


/**
 * Insert content into 'robot_content' collection during crawling
 * @param  {String} pageURL  - url of pagination link: http://www.adsuu.com/business-offer-9/
 * @param  {Object} db       - db mongo object
 * @param  {String} contentCollection - MongoDB collection name: content_business
 * @param  {Object} insMoDoc - MongoDB document to be inserted: {_id, task_is, page, dateTime, links[]}
 * @return {[type]}          [description]
 */
module.exports.insertNewContent = function (contentCollection, insContentDoc) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':114 ' + err); }

    var condition = {"pageURL": insContentDoc.pageURL};
    db.collection(contentCollection).find(condition).toArray(function (err, moCont_arr) { //check if pageURL already exists
      if (err) { logg.byWinston('error', __filename + ':25 ' + err); }

      var moCont = moCont_arr[0];

      if (moCont === undefined) {//if pageURL doesn't exist in 'robot_content'

        db.collection(contentCollection).find().sort({cid: -1}).limit(1).toArray(function (err, moMax_arr) { //find max ID
          if (err) { logg.byWinston('error', __filename + ':100 ' + err); }

          //set new insContentDoc.id from max id value
          if (moMax_arr[0] !== undefined) {
            insContentDoc.cid = moMax_arr[0].cid + 1;
          } else {
            insContentDoc.cid = 0;
          }


          db.collection(contentCollection).insert(insContentDoc, function (err) { //insert new content into robot_content
            if (err) { logg.byWinston('error', __filename + ':103 ' + err); }

            db.close();
          });

        });

      } else { //if page URL already exist in 'robot_content'
        db.close();
      }

    });

  });

};
