/**
 * crawler.linkQueue_* model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');
var pagination = require('libraries/pagination.js');
// var nodedump = require('nodedump').dump;

//mongo parameters
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_tasks = settings.mongo.dbColl_tasksLnk_iterate;

/**
 * Insert links into linkQueue_* collection
 * @param  {String} pageURL  - url of pagination link: http://www.adsuu.com/business-offer-9/
 * @param  {Object} db       - db mongo object
 * @param  {String} collName - MongoDB collection name: linkQueue_adsuu_com_business
 * @param  {Object} insMoDoc - MongoDB document to be inserted: {_id, task_is, page, dateTime, links[]}
 * @return {[type]}          [description]
 */
module.exports.insertLinks = function (pageURL, db, collName, insMoDoc) {

  db.collection(collName).createIndex({page: 1}, {unique: true, sparse: true}, function (err) { //create unique index to prevent duplicated documents
    if (err) { logg.byWinston('error', __filename + ':27 ' + err); }

    db.collection(collName).find({"pageURL": pageURL}).toArray(function (err, moTask2_arr) { //check if collection already exists
      if (err) { logg.byWinston('error', __filename + ':30 ' + err); }

      //if collection already exists do UPDATE
      if (moTask2_arr.length !== 0) {

        db.collection(collName).update({"pageURL": pageURL}, insMoDoc, function (err) {
          if (err) {
            logg.craw(false, 'crawlingLinks_dump', '--------  ERROR when updating MongoDB: ' + err);
          } else {
            logg.craw(false, 'crawlingLinks_dump', '--------  UPDATED in MongoDB');
          }
        });

      } else { //if collection doesn't exist do INSERT

        db.collection(collName).insert(insMoDoc, function (err) {
          if (err) {
            logg.craw(false, 'crawlingLinks_dump', '--------  ERROR when inserting in MongoDB: ' + err);
          } else {
            logg.craw(false, 'crawlingLinks_dump', '--------  INSERTED in MongoDB');
          }
        });

      }

    });

  });

};




module.exports.listLinks = function (req, res, cb_list) {

  //input variables
  var q, taskName;
  if (req.method === 'GET') {
    q = (req.query.q === undefined) ? '' : req.query.q;
    taskName = (req.query.taskName === undefined) ? '' : req.query.taskName;
  } else {
    q = (req.body.q === undefined) ? '' : req.body.q;
    taskName = (req.body.taskName === undefined) ? '' : req.body.taskName;
  }


  //define query
  var queryDB;
  if (q === '') {
    queryDB = {};
  } else {
    var reg = new RegExp(q, 'ig'); //creating regular expression
    queryDB = {"links.tekst": {"$regex": reg}};
    // queryDB = {"links.tekst": reg};
  }

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':73 ' + err); }

    db.collection(collName_tasks).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) { //all tasks to fill SELECT tag
      if (err) { logg.byWinston('error', __filename + ':76 ' + err); }

      /* define linkQueue collection */

      //define taskName if it is not defined or it is empty string
      if (taskName === '' || taskName === undefined) {
        taskName = moTasksDocs_arr[0].name;
      }

      //define linkQueue_* coll. name
      var collName_linkQueue = 'linkQueue_' + taskName;

      db.collection(collName_linkQueue).count(queryDB, function (err, countNum) {
        if (err) { logg.byWinston('error', __filename + ':94 ' + err); }

        /* create pagination object which is sent to view file */
        var pagesPreURI = '/admin/crawllinks/resultsiteration/?q=' + q + '&taskName=' + taskName + '&currentPage=';
        var perPage = 15; //show results per page
        var spanNum = 4; //show pagination numbers. Must be even number (paran broj)
        var pagination_obj = pagination.paginator(req, countNum, pagesPreURI, perPage, spanNum);

        db.collection(collName_linkQueue).find(queryDB).skip(pagination_obj.skipNum).limit(pagination_obj.perPage).toArray(function (err, moQueueDocs_arr) {
          if (err) { logg.byWinston('error', __filename + ':103 ' + err); }

          cb_list(res, moTasksDocs_arr, moQueueDocs_arr, pagination_obj);
        });

      });

    });

  }); //connect

};