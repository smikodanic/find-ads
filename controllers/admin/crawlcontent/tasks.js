require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var login = require('libraries/accountLoginLib.js');
var filedir = require('libraries/filedirLib.js');
var taskContent_model = require('models/taskContent_model');

var cb_list_Render = function (res, linkQueue_colls, moTasksDocs_arr, moCatsDocs_arr) {
  var vdata = {
    task: {},
    tasks: moTasksDocs_arr,
    linkQueue_colls: linkQueue_colls,
    cats: moCatsDocs_arr,
    pollingFiles: filedir.listJSFiles('0crawler/crawlcontent/polling/'),
    httpclientFiles: filedir.listJSFiles('0crawler/crawlcontent/httpclient/')
  };
  res.render('./admin/crawlcontent/tasksContent', vdata);
};

var cb_list2_Render = function (res, linkQueue_colls, moTasksDocs_arr, moCatsDocs_arr, moTaskEdit_arr) {
  var vdata = {
    task: moTaskEdit_arr[0],
    tasks: moTasksDocs_arr,
    linkQueue_colls: linkQueue_colls,
    cats: moCatsDocs_arr,
    pollingFiles: filedir.listJSFiles('0crawler/crawlcontent/polling/'),
    httpclientFiles: filedir.listJSFiles('0crawler/crawlcontent/httpclient/')
  };
  res.render('./admin/crawlcontent/tasksContent', vdata);
};




module.exports = function (router) {


  router.get('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskContent_model.listTasks(res, cb_list_Render);
    } else {
      res.redirect('/admin');
    }

  });


  //insert into MongoDB
  router.post('/insert', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskContent_model.insertTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });


  //delete task from MongoDB
  router.get('/delete/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskContent_model.deleteTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });


  //edit task
  router.get('/edit/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskContent_model.editTask(req, res, cb_list2_Render);
    } else {
      res.redirect('/admin');
    }

  });


  //update task
  router.post('/update/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskContent_model.updateTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });


  //disable all tasks
  router.get('/disable', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskContent_model.disableTasks(res);
    } else {
      res.redirect('/admin');
    }

  });


  /**
   * Start crawling task from browser
   * To start crawling tasks from command line use: $pm2 start 0/crawler/crawlcontent/linkQueue_cli.js 2
   * @param {number} :task_id -id of the task from 'contentTasks' collection 
   */
  router.get('/start/:task_id', function (req, res) {

    //check username and password
    var sess_tf = login.checksess_user_pass(req);

    //id from req e.g. from URI
    var task_id = parseInt(req.params.task_id, 10); //use parseint to convert string into number

    //callback: output crawling results to browser
    var cb_outResults = {
      send: function (rezult) {
        res.write(rezult);
      },
      end: function () {
        res.end();
      }
    };

    if (sess_tf) {

      /* start crawling in same NodeJS process */
      var MongoClient = require('mongodb').MongoClient;
      var logg = require('libraries/loggLib');
      var settings = require('settings/admin.js');
      var dbName = settings.mongo.dbName;
      var collName_tasksCnt = settings.mongo.dbColl_tasksCnt;

      // Connect to MongoDB 'contentTasks' collection to get 'pollScript' value
      MongoClient.connect(dbName, function (err, db) {
        if (err) { logg.me('error', __filename + ':175 ' + err); }

        db.collection(collName_tasksCnt).find({"id": task_id}).toArray(function (err, contentTasks_arr) { //get pollScript for a given task ID
          if (err) { logg.me('error', __filename + ':178 ' + err); }

          //activate poll script for content crawling: 0crawler/crawlcontent/polling/linkQueue_polling.js
          var pollContentLinks = require('0crawler/crawlcontent/polling/' + contentTasks_arr[0].pollScript);
          pollContentLinks.start(task_id, cb_outResults);

          db.close(); //close DB connection
        });

      });



    } else {
      res.redirect('/admin');
    }

  });


  //stop crawling
  router.get('/stop', function (req, res) {

    //check username and password
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      clearInterval(global.intId);
      res.redirect('/admin/crawlcontent/tasks');
    } else {
      res.redirect('/admin');
    }

  });






}; //module end
