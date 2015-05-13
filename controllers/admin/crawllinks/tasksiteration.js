/*jslint unparam: true*/

var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('../../../libraries/account_login.js');
var category_model = require('../../../models/category_model');
var task_model = require('../../../models/task_model');

var cb_list_Render = function (res, moTasksDocs_arr, moCatsDocs_arr) {
  var vdata = {
    task: {},
    tasks: moTasksDocs_arr,
    cats: moCatsDocs_arr
  };
  res.render('./admin/crawllinks/tasksiteration', vdata);
};

var cb_list2_Render = function (res, moTaskEdit_arr, moTasksDocs_arr, moCatsDocs_arr) {
  var vdata = {
    task: moTaskEdit_arr[0], //task to be edited (object is sent to .ejs file)
    tasks: moTasksDocs_arr, //list tasks
    cats: moCatsDocs_arr //list categories & subcategories in SELECT tags
  };
  res.render('./admin/crawllinks/tasksiteration', vdata);
};



module.exports = function (router) {


  router.get('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      task_model.listTasks(res, cb_list_Render, 'tasks_LinkIterate');
    } else {
      res.redirect('/admin');
    }

  });


  //insert into MongoDB
  router.post('/insert', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      task_model.insertTask(req, res, 'tasks_LinkIterate');
    } else {
      res.redirect('/admin');
    }

  });


  //delete task from MongoDB
  router.get('/delete/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      task_model.deleteTask(req, res, 'tasks_LinkIterate');
    } else {
      res.redirect('/admin');
    }

  });


  //edit task
  router.get('/edit/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      task_model.editTask(req, res, cb_list2_Render, 'tasks_LinkIterate');
    } else {
      res.redirect('/admin');
    }

  });


  //update task
  router.post('/update/:id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      task_model.updateTask(req, res, 'tasks_LinkIterate');
    } else {
      res.redirect('/admin');
    }

  });

  //disable all tasks
  router.get('/disable', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      task_model.disableTasks(res, 'tasks_LinkIterate');
    } else {
      res.redirect('/admin');
    }

  });



};
