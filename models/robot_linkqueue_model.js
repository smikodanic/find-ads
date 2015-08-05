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
var collName_tasks = settings.mongo.dbColl_robotTasks;



module.exports.listLinks = function (req, res, cb_list) {

  //input variables
  var q, task_id;
  if (req.method === 'GET') {
    q = (req.query.q === undefined) ? '' : req.query.q;
    task_id = (req.query.task_id === undefined) ? '' : req.query.task_id;
  } else {
    q = (req.body.q === undefined) ? '' : req.body.q;
    task_id = (req.body.task_id === undefined) ? '' : req.body.task_id;
  }

  if (task_id === undefined || task_id === '') {
    task_id = 0;
  }


  //define db query
  var queryDB;
  if (q === '') {
    queryDB = {};
  } else {
    var reg = new RegExp(q, 'ig'); //creating regular expression
    queryDB = {$or: [{ "link.tekst": {"$regex": reg} }, { "link.href": {"$regex": reg} }]};
    // queryDB = {"link.tekst": {"$regex": reg}};
    // queryDB = {"link.tekst": reg};
  }

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':42 ' + err); }

    db.collection(collName_tasks).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) { //all tasks to fill SELECT tag
      if (err) { logg.byWinston('error', __filename + ':45 ' + err); }

      /* define linkQueue collection: 'robot_linkqueue_*' */
      var collName_linkQueue = moTasksDocs_arr[task_id].linkqueueCollection;

      db.collection(collName_linkQueue).count(queryDB, function (err, countNum) { // gets data from 'robot_linkqueue_*'
        if (err) { logg.byWinston('error', __filename + ':51 ' + err); }

        /* create pagination object which is sent to view file */
        var pagesPreURI = '/admin/robot/linkqueue/?q=' + q + '&task_id=' + task_id + '&currentPage=';
        var perPage = 15; //show results per page
        var spanNum = 4; //show pagination numbers. Must be even number (paran broj)
        var pagination_obj = pagination.paginator(req, countNum, pagesPreURI, perPage, spanNum);

        db.collection(collName_linkQueue).find(queryDB).sort({lid: 1}).skip(pagination_obj.skipNum).limit(pagination_obj.perPage).toArray(function (err, moQueueDocs_arr) {
          if (err) { logg.byWinston('error', __filename + ':103 ' + err); }

          cb_list(res, task_id, moTasksDocs_arr, moQueueDocs_arr, pagination_obj);
        });

      });

    });

  }); //connect

};


module.exports.deleteLink = function (req, res) {

  //input
  var coll = req.params.coll;
  var task_id = parseInt(req.params.task_id, 10);

  //define selector and deleting options
  var selector, options;
  if (req.params.lid === 'all') {
    selector = {"lid": { $ne: 0 }}; //delete all except lid=0
    // selector = {}; //delete all except lid=0
    options = {};
  } else {
    var lid = parseInt(req.params.lid, 10);
    selector = {"lid": lid};
    options = {};
  }

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':96 ' + err); }

    db.collection(coll).remove(selector, options, function (err) {
      if (err) { logg.byWinston('error', __filename + ':99 ' + err); }

      res.redirect('/admin/robot/linkqueue/?task_id=' + task_id);
      console.log(selector);

      // logg.byWinston('info', __filename + ':103 Deleted records:' + status, null);
      db.close();
    });

  }); //connect

};