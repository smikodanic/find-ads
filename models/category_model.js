/**
 * crawler.category model
 */

var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/logging.js');


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
      "subcats": subcats_arr
    };
  } else {
    insDoc = null;
  }


  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {

    if (err) { logg.me('error', __filename + ':47 ' + err, res); }

    if (insDoc !== null) {

      db.collection('category').find().sort({id: -1}).limit(1).toArray(function (err, moDocs_arr) { //find max ID
        if (err) { logg.me('error', __filename + ':52 ' + err, res); }

        //define new insDoc.id from max id value
        if (moDocs_arr[0] !== undefined) {
          insDoc.id = moDocs_arr[0].id + 1;
        } else {
          insDoc.id = 0;
        }

        db.collection('category').insert(insDoc, function (err) {
          if (err) { logg.me('error', __filename + ':47 ' + err, res); }

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

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {

    if (err) { logg.me('error', __filename + ':84 ' + err, res); }

    //list results
    db.collection('category').find({}).sort({id: 1}).toArray(function (err, moDocs_arr) {
      if (err) { logg.me('error', __filename + ':88 ' + err, res); }

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

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':117 ' + err, res); }

    db.collection('category').remove(selector, options, function (err, status) {
      if (err) { logg.me('error', __filename + ':120 ' + err, res); }

      res.redirect('/admin/categories/');

      logg.me('info', __filename + ':124 Deleted records:' + status, null);
      db.close();
    });

  }); //connect

};



module.exports.editCategory = function (req, res, cb_list2) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  var selector = {"id": id_req};

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':142 ' + err, res); }

    db.collection('category').find(selector).toArray(function (err, moDocEdit_arr) {
      if (err) { logg.me('error', __filename + ':145 ' + err, res); }

      //list results
      db.collection('category').find({}).sort({id: 1}).toArray(function (err, moDocs_arr) {
        if (err) { logg.me('error', __filename + ':149 ' + err, res); }

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
      "subcats": subcats_arr
    };
  } else {
    newDoc = null;
  }

  MongoClient.connect("mongodb://localhost:27017/crawler", function (err, db) {
    if (err) { logg.me('error', __filename + ':190 ' + err, res); }

    db.collection('category').update(selector, newDoc, function (err, status) {
      if (err) { logg.me('error', __filename + ':193 ' + err, res); }

      res.redirect('/admin/categories/edit/' + id_req);
      logg.me('info', __filename + ':197 Updated records:' + status, null);
      db.close();
    });

  }); //connect

};
