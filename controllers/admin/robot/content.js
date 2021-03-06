require('rootpath')(); //enable requireing modules from application root folder
var express = require('express');
var router = express.Router();
var login = require('libraries/accountLoginLib.js');
var robot_content_model = require('models/robot_content_model');

var cb_list_Render = function (res, currentColl, contentColls, moContentsDocs_arr, pagination_obj) {
  var vdata = {
    currentColl: currentColl,
    contentColls: contentColls, //to pupulate SELECT tag
    contents: moContentsDocs_arr,
    pagination: pagination_obj
  };
  // console.log(JSON.stringify(vdata, null, 2));
  res.render('./admin/robot/content', vdata);
};



module.exports = function (router) {

  /**
   * Delete one link from linkqueue
   */
  router.get('/delete/:coll/:cid/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      robot_content_model.deleteContent(req, res);
    } else {
      res.redirect('/admin');
    }

  });

  router.get('/*', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      robot_content_model.listContent(req, res, cb_list_Render);
    } else {
      res.redirect('/admin');
    }

  });


  router.post('/', function (req, res) {

    //check if username and password are good in session storage
    var sess_tf = login.checksess_user_pass(req);

    if (sess_tf) {
      robot_content_model.listContent(req, res, cb_list_Render);
    } else {
      res.redirect('/admin');
    }

  });

};
