/**
 * crawler.category model
 */

var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/logging.js');


module.exports.insertTask = function (req, res, collName) {

  //define document to be inserted
  var insDoc;
  if (req.body.name !== '' && req.body.iteratingurl !== '') {
    insDoc = req.body;
    insDoc.id = parseInt(req.body.id, 10); //convert 'id' from string into number
  } else {
    insDoc = null;
  }


  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':21 ' + err, res); }

    if (insDoc !== null) {

      db.collection(collName).find().sort({id: -1}).limit(1).toArray(function (err, moDocs_arr) { //find max ID
        if (err) { logg.me('error', __filename + ':25 ' + err, res); }

        //define new insDoc.id from max id value
        if (moDocs_arr[0] !== undefined) {
          insDoc.id = moDocs_arr[0].id + 1;
        } else {
          insDoc.id = 0;
        }

        db.collection(collName).insert(insDoc, function (err) {
          if (err) { logg.me('error', __filename + ':21 ' + err, res); }

          //on successful insertion do redirection
          res.redirect('/admin/tasks/links/iterateurl');
          db.close();
        });

      });
    } else {
      res.send('Cannot insert empty doc!');
    }

  }); //connect

};


module.exports.listTasks = function (res, cb_list, collName) {

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':57 ' + err, res); }

    //list results
    db.collection(collName).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) {
      if (err) { logg.me('error', __filename + ':61 ' + err, res); }

      db.collection('category').find({}).sort({id: 1}).toArray(function (err, moCatsDocs_arr) {
        if (err) { logg.me('error', __filename + ':64 ' + err, res); }

        cb_list(res, moTasksDocs_arr, moCatsDocs_arr);
        db.close();
      });

    });

  }); //connect

};



module.exports.deleteTask = function (req, res, collName) {

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

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':95 ' + err, res); }

    db.collection(collName).remove(selector, options, function (err, status) {
      if (err) { logg.me('error', __filename + ':98 ' + err, res); }

      res.redirect('/admin/tasks/links/iterateurl');
      logg.me('error', __filename + ':21 Deleted records:' + status, null);
      db.close();
    });

  }); //connect

};



module.exports.editTask = function (req, res, cb_list2, collName) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  var selector = {"id": id_req};

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':119 ' + err, res); }

    db.collection(collName).find(selector).toArray(function (err, moTaskEdit_arr) { //get current task (by 'id') to edit
      if (err) { logg.me('error', __filename + ':122 ' + err, res); }

      db.collection(collName).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) { //list tasks
        if (err) { logg.me('error', __filename + ':125 ' + err, res); }

        db.collection('category').find({}).sort({id: 1}).toArray(function (err, moCatsDocs_arr) { //list categories & subcategories in SELECT
          if (err) { logg.me('error', __filename + ':128 ' + err, res); }

          cb_list2(res, moTaskEdit_arr, moTasksDocs_arr, moCatsDocs_arr);
          db.close();
        });

      });

    });

  }); //connect

};


module.exports.updateTask = function (req, res, collName) {

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

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':160 ' + err, res); }

    db.collection(collName).update(selector, newDoc, function (err, status) {
      if (err) { logg.me('error', __filename + ':163 ' + err, res); }

      res.redirect('/admin/tasks/links/iterateurl/edit/' + id_req);
      logg.me('error', __filename + ':166 Updated records: ' + status, null);
      db.close();
    });

  }); //connect

};


module.exports.disableTasks = function (res, collName) {


  var selector = {};
  var update = {$set: {"status": 0}};

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':182 ' + err, res); }

    db.collection(collName).update(selector, update, function (err, status) {
      if (err) { logg.me('error', __filename + ':185 ' + err, res); }

      res.redirect('/admin/tasks/links/iterateurl');
      logg.me('error', __filename + ':166 Updated records: ' + status, null);
      db.close();
    });

  }); //connect

};
