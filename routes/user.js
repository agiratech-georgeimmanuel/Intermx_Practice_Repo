const {User} = require('../models/user')
const CrudRouter = require("../lib/crudRouter");
const CrudService = require("./../lib/crudService");
const mongoose = require('mongoose');
const validator = require('../lib/validate');
const utils = require('../lib/utils')
const isAuthorized = require('../middlewares/isAuthorized')
const express = require("express");
const router = express.Router();
const tools = require('../helper/tools')
const { error, success } = require("./../config/messages");
const formatRules = (req, res, next) => {
  res.locals.uniqueId = Number(new Date())
  res.locals.rules = {
    "name": `required|string|exist:${res.locals.uniqueId}|max:300`,
    "email": "email",
    "address.line": "string|max:300",
    "address.zipcode": "string|max:300",
    "address.city": "string|max:300",
    "address.state": "string|max:300",
  };
  next();
}

const validateRequest = (req, res, next) => {
    let { body: data} = req || {};
    let { rules = {}, customMessage = {}, customAttributeNames = {} } = res.locals || {};
    /*** exist validation purpose added ***/
    // let existCheckQuery = utils.defaultExistCheckQuery(req, res)
    // data.existValidationQuery = existCheckQuery
    data.modelFileObject = User
    data.uniqueId = res.locals.uniqueId
     /*** exist validation purpose added ***/
  
    validator(data, rules, customMessage, customAttributeNames, (err, status) => {
      if (!status) {
        if(err && err.errors) {
          let errorMessage = new Error(err.errors[Object.keys(err.errors)[0]][0]);
          errorMessage = tools.formatMessage(errorMessage, err, customAttributeNames);
          errorMessage.status = 400;
          next(errorMessage);
        } else {
          next(err);  
        }
      } else {
         res.locals.validatedData = data;
        next()
      }
    });
  }

  const defaultPopulate = (req, res, next) => {
    res.locals.populate = [{
      path: "parentUser",
      select: ["name"]
    }]
    next();
  };

const validations = {
    "create": [
      function(req, res, next) {
        res.locals.permission = 'userCreate';
        next();
      },
    formatRules,
    validateRequest,
     ],
    "list": [
      function(req, res, next) {
        res.locals.permission = 'userView';
        next();
      },
      defaultPopulate,
    ],
    "read": [
      function(req, res, next) {
        res.locals.permission = 'userView';
        next();
      },
       defaultPopulate,
    ],
    "update": [
      function(req, res, next) {
        res.locals.permission = 'clientEdit';
        next();
      },
       formatRules,
      validateRequest,
    ],
    "delete": [
      function(req, res, next) {
        res.locals.permission =  'userDelete';
        next();
      },
    ]
  }

const crudRouter = new CrudRouter(User, validations, 'user');



module.exports = [router, crudRouter.router];
