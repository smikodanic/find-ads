/*jslint unparam: true*/

require('rootpath')(); //enable requiring modules from application root folder
var express = require('express');
var router = express.Router();
var nodedump = require('nodedump').dump;
var login = require('libraries/account_login.js');
var category_model = require('models/category_model');



var cb_list_Render = function (res, moDocs_arr) {
  var vdata = {
    moDocs_arr: moDocs_arr,
    moDocEdit_arr: undefined
  };
  res.render('./admin/categories', vdata);
};

var cb_list2_Render = function (res, moDocs_arr, moDocEdit_arr) {
  var vdata = {
    moDocs_arr: moDocs_arr,
    moDocEdit_arr: moDocEdit_arr
  };
  res.render('./admin/categories', vdata);
};

module.exports = function (router) {

  router.get('/', function (req, res) {

    //require model
    category_model.listCategories(res, cb_list_Render);

  });


  /* receive FORM variables and insert into MongoDB */
  router.post('/insert', function (req, res) {

    //require model
    category_model.insertCategory(req, res);

    // res.render('./admin/categories');
    // res.send(nodedump(req)).end(); //debug POST variables
  });


  /* delete category */
  router.get('/delete/:id', function (req, res) {

    //require model
    category_model.deleteCategory(req, res);

  });


   /* edit - update category */
  router.get('/edit/:id', function (req, res) {

    //require model
    category_model.editCategory(req, res, cb_list2_Render);

  });
  router.post('/update/:id', function (req, res) {

    //require model
    category_model.updateCategory(req, res);

  });


};
