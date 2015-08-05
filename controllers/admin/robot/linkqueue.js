require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var login = require('libraries/accountLoginLib.js');
var robot_linkqueue_model = require('models/robot_linkqueue_model');

var cb_list_Render = function (res, task_id, moTasksDocs_arr, moQueueDocs_arr, pagination_obj) {
  var vdata = {
    task_id: task_id,
    tasks: moTasksDocs_arr,
    queue: moQueueDocs_arr,
    pagination: pagination_obj
  };
  // console.log(JSON.stringify(vdata, null, 2));
  res.render('./admin/robot/linkqueue', vdata);
};



module.exports = function (router) {

  /**
   * Delete one link from linkqueue
   */
  router.get('/delete/:coll/:lid/:task_id', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      robot_linkqueue_model.deleteLink(req, res);
    } else {
      res.redirect('/admin');
    }

  });

  router.get('/*', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      robot_linkqueue_model.listLinks(req, res, cb_list_Render);
    } else {
      res.redirect('/admin');
    }

  });


  router.post('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      robot_linkqueue_model.listLinks(req, res, cb_list_Render);
    } else {
      res.redirect('/admin');
    }

  });

};
