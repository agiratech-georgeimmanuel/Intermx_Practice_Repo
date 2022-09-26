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
         res.locals = data;
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

  // const createNotes = (req, res, next) => {
  //   let { record, validatedData } = res.locals || {};
  //   let { notes = undefined } = validatedData || {};
  //   let request = {
  //     headers : req.headers
  //   }
  //   if(notes) {
  //     request.notes = notes;
  //     notesService.createOrUpdateNotes(request, "post", "clients", record._id)
  //     .then((result) => {
  //       return Client.updateOne({
  //         _id: record._id
  //       }, {notes: result.id});
  //     })
  //     .then(() => {
  //       next();
  //     })
  //     .catch((err) => {
  //       return res.status(400).send(tools.dynamicMsg(error['addNotesFailure'], [], [err.message]));
  //     })
  //   } else {
  //     next();
  //   }
  // }

const validations = {
    "create": [
      function(req, res, next) {
        res.locals.permission = 'userCreate';
        next();
      },
    // isAuthorized,
    //   defaultFilter,
    //   setCustomLabels,
    formatRules,
    validateRequest,
    //   validateParent,
    //   formatClient,
    //   createOrUpdateOrganization,
    //   invalidRelatedCache,
     ],
    // "postCreate": [
    //   createNotes
    // ],
    // "list": [
    //   function(req, res, next) {
    //     res.locals.permission = 'clientView';
    //     next();
    //   },
    //   isAuthorized,
    //   setCustomLabels,
    //   defaultPopulate,
    //   defaultFilter,
    //   defaultProjection,
    //   dynamicProjection,
    //   defaultSort,
    //   dynamicSort,
    //   userClientAccess,
    //   dynamicSearchAndFilter,
    //   defineSearchCache
    // ],
    "read": [
      function(req, res, next) {
        res.locals.permission = 'userView';
        next();
      },
     // isAuthorized,
       defaultPopulate,
      // defaultFilter,
      // defaultProjection,
      // dynamicProjection
    ],
    // "postRead": [
    //   dynamicPopulate
    // ],
    // "update": [
    //   function(req, res, next) {
    //     res.locals.permission = 'clientEdit';
    //     next();
    //   },
    //   isAuthorized,
    //   setCustomLabels,
    //   defaultFilter,
    //   assignRules,
    //   checkRules,
    //   formatRules,
    //   validateRequest,
    //   validateParent,
    //   formatClient,
    //   invalidRelatedCache
    // ],
    // "postUpdate": [
    //   createOrUpdateNotes,
    //   createOrUpdateOrganization,
    //   async (req, res, next) => {
    //     let { modifiedFields, record } = res.locals;
    //     res.locals.ioViewQuery = { "clientId": record._id };
  
    //     if (Object.keys(modifiedFields).includes("mediaClientCode")) {
    //       // delete associated ios
    //       await deleteAssociatedIos({
    //         "client.clientId": record._id,
    //         isLocked: true,
    //         isDeleted: false,
    //         deletedStatus: false,
    //       });
  
    //       // change associated lineitemids
    //       await resetAssociatedIds(
    //         {
    //           clientId: record._id,
    //           deletedAt: null,
    //         },
    //         "client",
    //         req.body.mediaClientCode
    //       );
    //     }
  
    //     reloadIOView(req, res, next);
    //   },
    //   // validateAssociations,
    //   // insertionOrderRuleUpdation,clientDelete
    //   // sendKafkaResponse
    // ],
    "delete": [
      function(req, res, next) {
        res.locals.permission =  'userDelete';
        next();
      },
      // isAuthorized,
      // defaultFilter,
      // invalidRelatedCache
    ]
  }

const crudRouter = new CrudRouter(User, validations, 'user');



module.exports = [router, crudRouter.router];
