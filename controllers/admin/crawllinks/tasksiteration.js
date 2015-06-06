require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var filedir = require('libraries/filedirLib.js');
var login = require('libraries/accountLoginLib');
var taskLink_model = require('models/taskLink_model');



var cb_list_Render = function (res, moTasksDocs_arr, moCatsDocs_arr) {
  var vdata = {
    task: {},
    tasks: moTasksDocs_arr,
    cats: moCatsDocs_arr,
    httpclientFiles: filedir.listJSFiles('0crawler/crawllinks/httpclient/')
  };
  res.render('./admin/crawllinks/tasksiteration', vdata);
};

var cb_list2_Render = function (res, moTaskEdit_arr, moTasksDocs_arr, moCatsDocs_arr) {
  var vdata = {
    task: moTaskEdit_arr[0], //task to be edited (object is sent to .ejs file)
    tasks: moTasksDocs_arr, //list tasks
    cats: moCatsDocs_arr, //list categories & subcategories in SELECT tags
    httpclientFiles: filedir.listJSFiles('0crawler/crawllinks/httpclient/')
  };
  res.render('./admin/crawllinks/tasksiteration', vdata);
};





module.exports = function (router) {


  router.get('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskLink_model.listTasks(res, cb_list_Render);
    } else {
      res.redirect('/admin');
    }

  });


  //insert into MongoDB
  router.post('/insert', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskLink_model.insertTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });


  //delete task from MongoDB
  router.get('/delete/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskLink_model.deleteTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });


  //edit task
  router.get('/edit/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskLink_model.editTask(req, res, cb_list2_Render);
    } else {
      res.redirect('/admin');
    }

  });


  //update task
  router.post('/update/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskLink_model.updateTask(req, res);
    } else {
      res.redirect('/admin');
    }

  });

  //disable all tasks
  router.get('/disable', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      taskLink_model.disableTasks(res);
    } else {
      res.redirect('/admin');
    }

  });


  /**
   * start crawling task from browser
   * To start crawling tasks from command line use: 
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
      var poll = require('0crawler/crawllinks/polling/lnk_linkTasks_iterate');
      poll.start(task_id, cb_outResults);
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
      res.redirect('/admin/crawllinks/tasksiteration');
    } else {
      res.redirect('/admin');
    }

  });



};
