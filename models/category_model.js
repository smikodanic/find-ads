/**
 * crawler.category model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');

//mongo parameters
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName = settings.mongo.dbColl_category;


/* Some corrections of strings in Array*/
var korektor = function (arr) {

  arr.forEach(function (elem, index) {
    elem = elem.trim(); //trimming strings in array
    elem = elem.toLowerCase(); //to lowercase all strings in array
    arr[index] = elem;
  });

  return arr;
};


module.exports.insertCategory = function (req, res) {

  //POST variables
  var cat = req.body.cat;
  var fa = req.body.fa;
  var subcats = req.body.subcats; //string
  var subcats_arr = subcats.split(',');

  //corrections
  subcats_arr = korektor(subcats_arr);

  //define document to be inserted
  var insDoc;
  if (cat !== '' && subcats !== '') {
    insDoc = {
      "id": 0,
      "category": cat,
      "subcats": subcats_arr,
      "fa": fa
    };
  } else {
    insDoc = null;
  }


  MongoClient.connect(dbName, function (err, db) {

    if (err) { logg.byWinston('error', __filename + ':47 ' + err); }

    if (insDoc !== null) {

      db.collection(collName).find().sort({id: -1}).limit(1).toArray(function (err, moDocs_arr) { //find max ID
        if (err) { logg.byWinston('error', __filename + ':52 ' + err); }

        //define new insDoc.id from max id value
        if (moDocs_arr[0] !== undefined) {
          insDoc.id = moDocs_arr[0].id + 1;
        } else {
          insDoc.id = 0;
        }

        db.collection(collName).insert(insDoc, function (err) {
          if (err) { logg.byWinston('error', __filename + ':47 ' + err); }

          //on successful insertion do redirection
          res.redirect('/admin/categories/');
          db.close();
        });

      });

    } else {
      res.send('Cannot insert empty doc!');
    }

  }); //connect

};


module.exports.listCategories = function (res, cb_list) {

  MongoClient.connect(dbName, function (err, db) {

    if (err) { logg.byWinston('error', __filename + ':84 ' + err); }

    //list results
    db.collection(collName).find({}).sort({id: 1}).toArray(function (err, moDocs_arr) {
      if (err) { logg.byWinston('error', __filename + ':88 ' + err); }

      cb_list(res, moDocs_arr);
      db.close();
    });

  }); //connect

};



module.exports.deleteCategory = function (req, res) {

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
    if (err) { logg.byWinston('error', __filename + ':117 ' + err); }

    db.collection(collName).remove(selector, options, function (err, status) {
      if (err) { logg.byWinston('error', __filename + ':120 ' + err); }

      res.redirect('/admin/categories/');

      logg.byWinston('info', __filename + ':130 Deleted records:' + status, null);
      db.close();
    });

  }); //connect

};



module.exports.editCategory = function (req, res, cb_list2) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  var selector = {"id": id_req};

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':142 ' + err); }

    db.collection(collName).find(selector).toArray(function (err, moDocEdit_arr) {
      if (err) { logg.byWinston('error', __filename + ':145 ' + err); }

      //list results
      db.collection(collName).find({}).sort({id: 1}).toArray(function (err, moDocs_arr) {
        if (err) { logg.byWinston('error', __filename + ':149 ' + err); }

        cb_list2(res, moDocs_arr, moDocEdit_arr);
        db.close();
      });

    });

  }); //connect

};


module.exports.updateCategory = function (req, res) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  //POST variables
  var cat = req.body.cat;
  var fa = req.body.fa;
  var subcats = req.body.subcats; //string
  var subcats_arr = subcats.split(',');

  //corrections
  subcats_arr = korektor(subcats_arr);

  var selector = {"id": id_req};

  //define new document
  var newDoc;
  if (cat !== '' && subcats !== '') {
    newDoc = {
      "id": id_req,
      "category": cat,
      "subcats": subcats_arr,
      "fa": fa
    };
  } else {
    newDoc = null;
  }

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':196 ' + err); }

    db.collection(collName).update(selector, newDoc, function (err, status) {
      if (err) { logg.byWinston('error', __filename + ':199 ' + err); }

      logg.byWinston('info', __filename + ':201 Updated records:' + status, null);
      res.redirect('/admin/categories/edit/' + id_req);
      db.close();
    });

  }); //connect

};
