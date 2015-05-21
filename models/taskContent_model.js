/**
 * crawler.category model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/logging.js');

//mongo parameters
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_tasksCnt = settings.mongo.dbColl_tasksCnt;
var collName_cat = settings.mongo.dbColl_category;

/**
 * Create CSS selectors array
 */
var createSelectors = function (req) {
  var selectors = [], selector_str, selector_obj;

  req.body.selectorName.forEach(function (elem, key) {

    if (elem !== '') {
      selector_str = '{"type": "' + req.body.selectorType[key] + '", "name": "' + req.body.selectorName[key] + '", "value": "' + req.body.selectorValue[key] + '"}';
      selector_obj = JSON.parse(selector_str);

      selectors.push(selector_obj);
    }

  });

  return selectors;

};





module.exports.listTasks = function (res, cb_list) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.me('error', __filename + ':43 ' + err); }

    db.collections(function (err, colls) { //get all collections from database
      if (err) { logg.me('error', __filename + ':46 ' + err); }

      //filtering only linkQueue_* collections from array
      var linkQueue_colls = colls.filter(function (elem) {
        var reg = new RegExp('^linkQueue.*');
        return reg.test(elem.collectionName); //returns true or false
      });

      db.collection(collName_tasksCnt).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) { //content tasks
        if (err) { logg.me('error', __filename + ':55 ' + err); }

        db.collection(collName_cat).find({}).sort({id: 1}).toArray(function (err, moCatsDocs_arr) { //categories
          if (err) { logg.me('error', __filename + ':58 ' + err); }

          cb_list(res, linkQueue_colls, moTasksDocs_arr, moCatsDocs_arr);
          db.close();
        });

      });

    });

  }); //connect

};


/**
 * Insert new content task into MongoDB collection defined with 'collName_tasksCnt'
 * NOTICE: In order to work correctly set to 'true' app.use(bodyParser.urlencoded({ extended: true })); in /app.js file,
 * otherwise req.body.selectorName and req.body.selectorValue will not work 
 * 
 */
module.exports.insertTask = function (req, res) {

  /*create CSS selectors array*/
  var selectors = createSelectors(req);
  // console.log(JSON.stringify(selectors));


  /*define document to be inserted*/
  var insDoc;
  if (req.body.name !== '') {
    insDoc = req.body;

    //removing selectorType, selectorName and selectorValue arrays and replacing it with selectors array
    delete insDoc.selectorType;
    delete insDoc.selectorName;
    delete insDoc.selectorValue;
    insDoc.selectors = selectors;

  } else {
    insDoc = null;
  }
  // console.log(JSON.stringify(insDoc, null, 2));


  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.me('error', __filename + ':77 ' + err); }

    if (insDoc !== null) {

      db.collection(collName_tasksCnt).find().sort({id: -1}).limit(1).toArray(function (err, moDocs_arr) { //find max ID
        if (err) { logg.me('error', __filename + ':82 ' + err); }

        //define new insDoc.id from max id value
        if (moDocs_arr[0] !== undefined) {
          insDoc.id = moDocs_arr[0].id + 1;
        } else {
          insDoc.id = 0;
        }

        db.collection(collName_tasksCnt).insert(insDoc, function (err) {
          if (err) { logg.me('error', __filename + ':92 ' + err); }

          db.close();

          //on successful insertion do redirection
          res.redirect('/admin/crawlcontent/tasks');
        });

      });
    } else {
      res.send('Cannot insert empty doc! <script>setTimeout(function(){window.location.href="/admin/crawlcontent/tasks"}, 1500);</script>').end();
    }

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
    if (err) { logg.me('error', __filename + ':132 ' + err); }

    db.collection(collName_tasksCnt).remove(selector, options, function (err) { //delete task document
      if (err) { logg.me('error', __filename + ':105 ' + err); }

      // logg.me('info', __filename + ':110 Deleted records:' + status);
      db.close();
      res.redirect('/admin/crawlcontent/tasks');
    });

  }); //connect

};


module.exports.editTask = function (req, res, cb_list2) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  var selector = {"id": id_req};

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.me('error', __filename + ':155 ' + err); }

    db.collections(function (err, colls) { //get all collections from database
      if (err) { logg.me('error', __filename + ':158 ' + err); }

      //filtering only linkQueue_* collections from array
      var linkQueue_colls = colls.filter(function (elem) {
        var reg = new RegExp('^linkQueue.*');
        return reg.test(elem.collectionName); //returns true or false
      });

      db.collection(collName_tasksCnt).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) { //list all tasks to populate table
        if (err) { logg.me('error', __filename + ':167 ' + err); }

        db.collection(collName_tasksCnt).find(selector).toArray(function (err, moTaskEdit_arr) { //get current task (by 'id') to edit that task
          if (err) { logg.me('error', __filename + ':170 ' + err); }

          db.collection(collName_cat).find({}).sort({id: 1}).toArray(function (err, moCatsDocs_arr) {
            if (err) { logg.me('error', __filename + ':194 ' + err); }

            cb_list2(res, linkQueue_colls, moTasksDocs_arr, moCatsDocs_arr, moTaskEdit_arr);
            db.close();
          });

        });

      });

    });

  }); //connect

};


module.exports.updateTask = function (req, res) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  /*create CSS selectors array*/
  var selectors = createSelectors(req);
  // console.log(JSON.stringify(selectors));

  //mongoDB selector object
  var selectorDB = {"id": id_req};

  //define new document
  var newDoc;
  if (req.body.name !== '') {
    newDoc = req.body;

    //convert 'id' from string into number
    newDoc.id = parseInt(req.body.id, 10);

    //removing selectorType, selectorName and selectorValue arrays and replacing it with selectors array
    delete newDoc.selectorType;
    delete newDoc.selectorName;
    delete newDoc.selectorValue;
    newDoc.selectors = selectors;
  } else {
    newDoc = null;
  }

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.me('error', __filename + ':166 ' + err); }

    db.collection(collName_tasksCnt).update(selectorDB, newDoc, function (err, status) {
      if (err) { logg.me('error', __filename + ':169 ' + err); }

      // logg.me('info', __filename + ':172 Updated records: ' + status);
      db.close();
      res.redirect('/admin/crawlcontent/tasks');
    });

  }); //connect

};


module.exports.disableTasks = function (res) {

  var selectorDB = {};
  var update = {$set: {"status": 0}};
  var options = {
    multi: true //update multiple documents
  };

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.me('error', __filename + ':254 ' + err); }

    db.collection(collName_tasksCnt).update(selectorDB, update, options, function (err, status) {
      if (err) { logg.me('error', __filename + ':257 ' + err); }

      // logg.me('info', __filename + ':197 Updated records: ' + status);
      db.close();
      res.redirect('/admin/crawlcontent/tasks');
    });

  }); //connect

};
