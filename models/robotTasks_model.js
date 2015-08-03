/**
 * crawler.robotTasks model
 */

require('rootpath')();
var MongoClient = require('mongodb').MongoClient;
var logg = require('libraries/loggLib');
var cron = require('libraries/cronLib');

//mongo parameters
var settings = require('settings/admin.js');
var dbName = settings.mongo.dbName;
var collName_robotTasks = settings.mongo.dbColl_robotTasks;
var collName_cat = settings.mongo.dbColl_category;

/**
 * Create CSS selectors array
 */
var createSelectors = function (req) {
  var selectors = [], selector_str, selector_obj;

  // console.log(JSON.stringify(req.body, null, 2));
  req.body.selectorName.forEach(function (elem, key) {

    if (elem !== '') {

      //input 
      var selType =  req.body.selectorType[key];
      var selName =  req.body.selectorName[key];

      //creating selvalue string to be JSON.parsed later
      var selValue;
      if (req.body.selectorValue[key].indexOf(',') !== -1) {
        var selValue_arr = req.body.selectorValue[key].split(',');
        selValue = '["' + selValue_arr[0].trim() + '", "' + selValue_arr[1].trim() + '"]';
      } else {
        selValue =  '"' + req.body.selectorValue[key] + '"';
      }


      selector_str = '{"type": "' + selType + '", "name": "' + selName + '", "value": ' + selValue + '}';
      selector_obj = JSON.parse(selector_str);

      selectors.push(selector_obj);
    }

  });

  return selectors;

};





module.exports.listTasks = function (res, cb_list) {

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':59 ' + err); }

    db.collection(collName_robotTasks).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) { //robot tasks
      if (err) { logg.byWinston('error', __filename + ':71 ' + err); }

      db.collection(collName_cat).find({}).sort({id: 1}).toArray(function (err, moCatsDocs_arr) { //categories
        if (err) { logg.byWinston('error', __filename + ':74 ' + err); }

        cb_list(res, moTasksDocs_arr, moCatsDocs_arr);
        db.close();
      });

    });

  }); //connect

};



/**
 * Insert new robot task into MongoDB collection 'robot_tasks'
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
    delete insDoc.suggestCollection;
    insDoc.selectors = selectors;

  } else {
    insDoc = null;
  }
  // console.log(JSON.stringify(insDoc, null, 2));


  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':110 ' + err); }

    if (insDoc !== null) {

      db.collection(collName_robotTasks).find().sort({id: -1}).limit(1).toArray(function (err, moDocs_arr) { //find max ID
        if (err) { logg.byWinston('error', __filename + ':116 ' + err); }

        //define new insDoc.id from max id value
        if (moDocs_arr[0] !== undefined) {
          insDoc.id = moDocs_arr[0].id + 1;
        } else {
          insDoc.id = 0;
        }

        db.collection(collName_robotTasks).insert(insDoc, function (err) {
          if (err) { logg.byWinston('error', __filename + ':136 ' + err); }

          db.close();

          //restart cronInitCrawlers file and redirect to /admin/crawllinks/tasksiteration
          cron.restart(res, '/admin/robot/tasks');
        });

      });
    } else {
      res.send('Cannot insert empty doc! <script>setTimeout(function(){window.location.href="/admin/robot/tasks"}, 1500);</script>').end();
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
    if (err) { logg.byWinston('error', __filename + ':171 ' + err); }

    db.collection(collName_robotTasks).remove(selector, options, function (err, status) { //delete task document
      if (err) { logg.byWinston('error', __filename + ':174 ' + err); }

      logg.byWinston('info', __filename + ':176 Deleted records:' + status);
      db.close();

      //restart cronInitCrawlers file and redirect to /admin/crawllinks/tasksiteration
      cron.restart(res, '/admin/robot/tasks');
    });

  }); //connect

};


module.exports.editTask = function (req, res, cb_list2) {

  //id from req e.g. from URI
  var id_req = parseInt(req.params.id, 10); //use parseint to convert string into number

  var selector = {"id": id_req};

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':196 ' + err); }

    db.collections(function (err) { //get all collections from database
      if (err) { logg.byWinston('error', __filename + ':199 ' + err); }


      db.collection(collName_robotTasks).find({}).sort({id: 1}).toArray(function (err, moTasksDocs_arr) { //list all tasks to populate table
        if (err) { logg.byWinston('error', __filename + ':208 ' + err); }

        db.collection(collName_robotTasks).find(selector).toArray(function (err, moTaskEdit_arr) { //get current task (by 'id') to edit that task
          if (err) { logg.byWinston('error', __filename + ':211 ' + err); }

          db.collection(collName_cat).find({}).sort({id: 1}).toArray(function (err, moCatsDocs_arr) {
            if (err) { logg.byWinston('error', __filename + ':214 ' + err); }

            cb_list2(res, moTasksDocs_arr, moCatsDocs_arr, moTaskEdit_arr);
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
    delete newDoc.suggestCollection;
    newDoc.selectors = selectors;
  } else {
    newDoc = null;
  }

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':262 ' + err); }

    db.collection(collName_robotTasks).update(selectorDB, newDoc, function (err, status) {
      if (err) { logg.byWinston('error', __filename + ':265 ' + err); }

      logg.byWinston('info', __filename + ':267 Updated records: ' + status);
      db.close();

      //restart cronInitCrawlers file and redirect to /admin/crawllinks/tasksiteration
      cron.restart(res, '/admin/robot/tasks');
    });

  }); //connect

};



module.exports.disableTasks = function (res) {

  var selectorDB = {};
  var update = {$set: {"cronStatus": "off"}};
  var options = {
    multi: true //update multiple documents
  };

  MongoClient.connect(dbName, function (err, db) {
    if (err) { logg.byWinston('error', __filename + ':288 ' + err); }

    db.collection(collName_robotTasks).update(selectorDB, update, options, function (err, status) {
      if (err) { logg.byWinston('error', __filename + ':291 ' + err); }

      logg.byWinston('info', __filename + ':293 Updated records: ' + status);
      db.close();

      //restart cronInitCrawlers file and redirect to /admin/crawllinks/tasksiteration
      cron.restart(res, '/admin/robot/tasks');
    });

  }); //connect

};
