/**
 * crawler.category model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');
var cron = require('libraries/cronLib');

//mongo parameters
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName = settings.mongo.dbColl_tasksLnk_iterate;
var collName_cat = settings.mongo.dbColl_category;

module.exports.insertTask = function (req, res) {

  //define document to be inserted
  var insDoc;
  if (req.body.name !== '' && req.body.iteratingurl !== '') {
    insDoc = req.body;
  } else {
    insDoc = null;
  }


  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':27 ' + err); }

    if (insDoc !== null) {

      db.collection(collName).find().sort({id: -1}).limit(1).toArray(function (err, moDocs_arr) { //find max ID
        if (err) { logg.byWinston('error', __filename + ':33 ' + err); }

        //define new insDoc.id from max id value
        if (moDocs_arr[0] !== undefined) {
          insDoc.id = moDocs_arr[0].id + 1;
        } else {
          insDoc.id = 0;
        }

        db.collection(collName).insert(insDoc, function (err) {
          if (err) { logg.byWinston('error', __filename + ':43 ' + err); }

          db.close();

          //on successful insertion do redirection
          res.redirect('/admin/crawllinks/tasksiteration');
        });

      });
    } else {
      res.send('Cannot insert empty doc! <script>setTimeout(function(){window.location.href="/admin/crawlcontent/tasks"}, 1500);</script>');
    }

  }); //connect

};


module.exports.listTasks = function (res, cb_list) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':63 ' + err); }

    //list results
    db.collection(collName).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) {
      if (err) { logg.byWinston('error', __filename + ':67 ' + err); }

      db.collection(collName_cat).find({}).sort({id: 1}).toArray(function (err, moCatsDocs_arr) {
        if (err) { logg.byWinston('error', __filename + ':70 ' + err); }

        cb_list(res, moTasksDocs_arr, moCatsDocs_arr);
        db.close();
      });

    });

  }); //connect

};



module.exports.deleteTask = function (req, res) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  //define selector and deleting options
  var selector, options;
  if (req.params.id === 'all') {
    selector = {};
    options = {};
  } else {
    // selector = {id: id_req};
    selector = {"id": id_req};
    options = {};
  }

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':101 ' + err); }

    db.collection(collName).find(selector).toArray(function (err, moTasksDocs_arr) { // get task name to define linkQueue_* collection
      if (err) { logg.byWinston('error', __filename + ':105 ' + err); }

      //get collection name
      var collName_linkQueue = 'linkQueue_' + moTasksDocs_arr[0].name;

      db.collection(collName_linkQueue).drop(function (err) { //delete linkQueue_* collection where links are stored
        if (err) { logg.byWinston('error', __filename + ':110 ' + err + ' or ' + collName_linkQueue + ' collection doesnt exist'); }

        db.collection(collName).remove(selector, options, function (err, status) { //delete task document
          if (err) { logg.byWinston('error', __filename + ':105 ' + err); }

          logg.byWinston('info', __filename + ':115 Deleted records:' + status);
          db.close();
          res.redirect('/admin/crawllinks/tasksiteration');
        });

      });

    });

  }); //connect

};



module.exports.editTask = function (req, res, cb_list2) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  var selector = {"id": id_req};

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':125 ' + err); }

    db.collection(collName).find(selector).toArray(function (err, moTaskEdit_arr) { //get current task (by 'id') to edit
      if (err) { logg.byWinston('error', __filename + ':128 ' + err); }

      db.collection(collName).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) { //list tasks
        if (err) { logg.byWinston('error', __filename + ':131 ' + err); }

        db.collection('category').find({}).sort({id: 1}).toArray(function (err, moCatsDocs_arr) { //list categories & subcategories in SELECT
          if (err) { logg.byWinston('error', __filename + ':134 ' + err); }

          cb_list2(res, moTaskEdit_arr, moTasksDocs_arr, moCatsDocs_arr);
          db.close();
        });

      });

    });

  }); //connect

};


module.exports.updateTask = function (req, res) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  var selector = {"id": id_req};

  //define new document
  var newDoc;
  if (req.body.name !== '' && req.body.iteratingurl !== '') {
    newDoc = req.body;
    newDoc.id = parseInt(req.body.id, 10); //convert 'id' from string into number
  } else {
    newDoc = null;
  }

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':179 ' + err); }

    db.collection(collName).update(selector, newDoc, function (err, status) {
      if (err) { logg.byWinston('error', __filename + ':182 ' + err); }

      //restart cronInit file and redirect to /admin/crawllinks/tasksiteration
      cron.restart(res, '/admin/crawllinks/tasksiteration');

      logg.byWinston('info', __filename + ':187 Updated records: ' + status);
      db.close();
      // res.redirect('/admin/crawllinks/tasksiteration');
    });

  }); //connect

};


module.exports.disableTasks = function (res) {


  var selector = {};
  var update = {$set: {"cronStatus": "off"}};
  var options = {
    multi: true //update multiple documents
  };

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':204 ' + err); }

    db.collection(collName).update(selector, update, options, function (err, status) {
      if (err) { logg.byWinston('error', __filename + ':207 ' + err); }

      logg.byWinston('info', __filename + ':209 Updated records: ' + status);
      db.close();
      res.redirect('/admin/crawllinks/tasksiteration');
    });

  }); //connect

};
