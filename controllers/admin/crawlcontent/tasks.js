require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var login = require('libraries/account_login.js');
var taskContent_model = require('models/taskContent_model');
var crawlContent = require('0crawler/crawlcontent_getlinks');

var cb_list_Render = function (res, linkQueue_colls, moTasksDocs_arr, moCatsDocs_arr) {
  var vdata = {
    task: {},
    tasks: moTasksDocs_arr,
    linkQueue_colls: linkQueue_colls,
    cats: moCatsDocs_arr
  };
  res.render('./admin/crawlcontent/tasksContent', vdata);
};

var cb_list2_Render = function (res, linkQueue_colls, moTasksDocs_arr, moCatsDocs_arr, moTaskEdit_arr) {
  var vdata = {
    task: moTaskEdit_arr[0],
    tasks: moTasksDocs_arr,
    linkQueue_colls: linkQueue_colls,
    cats: moCatsDocs_arr
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
      crawlContent.start(task_id, cb_outResults);
    } else {
      res.redirect('/admin');
    }

  });


};
