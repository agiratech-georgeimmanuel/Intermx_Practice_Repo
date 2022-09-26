const express = require('express');
const mongoose = require('mongoose');
const validator = require('./validate');
const {success} = require('../config/messages')
const vsprintf = require("sprintf-js").vsprintf;


const dynamicMsg = (message, value, data) => {
    let responseMessage = {};
    responseMessage['status'] = message['status'];
    responseMessage['code'] = message['code'];
    responseMessage['api-message'] = vsprintf(message['api-message'], value);
    responseMessage['message'] = vsprintf(message['message'], value);
    if (data)
      responseMessage['data'] = data;
    return responseMessage;
  }

function CrudRouter(model,hooks, messageName = ""){
    const CrudService = require("../lib/crudService");
    const service = new CrudService(model);
    const router = express.Router();
    const validateRecord = (req, res, next) => {
        let { id } = req.params || {};
        const validationRule = {
          "id": "required|mongo_object_id"
        };
      
        validator({
          id
        }, validationRule, {}, {} ,(err, status) => {
          if (!status) {
            if(err && err.errors) {
              let errorMessage = new Error(err.errors[Object.keys(err.errors)[0]][0]);
              errorMessage.status = 400;
              next(errorMessage);
            } else {
              next(err);  
            }
          } else {
            let { query = {}, projection = {}, populate = [] } = res.locals || {};
  
            // populate based on projection
            let visibleFields = Object.keys(projection).filter(y => projection[y] === 1);
            if(visibleFields.length > 0) {
              populate = populate.filter(x => visibleFields.includes(x.path))
            }
  
            service
              .read({
                query: Object.assign(query, { _id: mongoose.Types.ObjectId(id) }),
                projection,
                populate
              })
              .then((result) => {
                res.locals.record = result;
      
                next();
              })
              .catch(next)
          }
        });
      }


      router.post(
        '/',
        hooks.create,
        function (req, res, next) {
        let  data = res.locals;
          service.create(data)
            .then((result) => {
              res.locals.record = result;
              res.locals.newRecord = true;
              next()
            })
            .catch(next)
        },
        hooks.postCreate || [],
        function(req, res) {
          let { record } = res.locals || {};
          return res.status(200).send(dynamicMsg(success['recordCreated'], [messageName], {id: record._id}));
        }
      );
   
    //   const listLogic = [
    //     formatPagination,
    //     hooks.list,
    //     searchCacheLogic,
    //     function (req, res, next) {
    //       let { pagination, query = {}, projection = {}, populate = [], sort = {}, mongoExport = false, defaultQuery = {} } = res.locals;
          
    //       // populate based on projection
    //       let visibleFields = Object.keys(projection).filter(y => projection[y] === 1);
    //       if(visibleFields.length > 0) {
    //         populate = populate.filter(x => visibleFields.includes(x.path))
    //       }
          
    //       service
    //         .list({ query, pagination, projection, populate, sort })
    //         .then((results = []) => {
    //           if(pagination.limit === 0) {
    //             return [results, false, false]
    //           } else {
    //             return Promise.all([service.count(defaultQuery), service.count(query)])
    //             .then(([count, found]) => {
    //               return [results, count, found]
    //             })
    //             .catch(next);
    //           }
    //         })
    //         .then(async ([results, count, found]) => {
    //           if(found === false) {
    //             let { fileName = messageName, transform, responseFormat, populate } = mongoExport || {}
    //             let { accept = 'text/csv' } = req.headers || {};
    //             let exportType = 'csv';
    //             if (['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(accept)) {
    //               exportType = 'xlsx';
    //             }
  
    //             // populate datas
    //             results = await populate(results, req, res);
  
    //             // format response data
    //             results = results.map(x => transform(x));
  
    //             // limit headers
    //             let { headers = {} } = req.body || {};
    //             if(Object.keys(headers).length === 0 && results[0]) {
    //               headers = Object.fromEntries(Object.keys(results[0]).map(k => [k, k]))
    //             }
              
    //             // filter 
    //             results = results.map(l => responseFormat(l, headers))
    //             if (exportType === 'csv') {
    //               res.writeHead(200, {
    //                 'Content-Type': 'text/csv',
    //                 'Access-Control-Expose-Headers': 'Content-Disposition',
    //                 'Content-Disposition': `attachment; filename="${fileName.replace(/[^a-zA-Z0-9]/g, "-")}.csv"`
    //               });
    //               return csv().from([headers].concat(results)).to(res);
    //             } else {
    //               const fields = [];
    //               Object.entries(headers).forEach(([key, val]) => {
    //                 fields.push({
    //                   header: val,
    //                   key: key,
    //                   width: 30
    //                 })
    //               })
    //               createExcel(results, fields, fileName).then((stream) => {
    //                 res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //                 res.setHeader('Content-Disposition', `attachment; filename=${fileName.replace(/[^a-zA-Z0-9]/g, "-")}.xlsx`);
    //                 res.setHeader('Content-Length', stream.length);
    //                 res.send(stream);
    //               });
    //             }
    //           } else {
    //             return res.status(200).send({
    //               pagination: {
    //                 total: count,
    //                 found: found,
    //                 page: +pagination.page,
    //                 perPage: +pagination.limit,
    //                 pageSize: results.length
    //               },
    //               results
    //             })
    //           }
    //         })
    //         .catch(next)
    //     }
    //   ];

    //   router.post('/search', listLogic);
    //   router.get('/', listLogic);
       // Retrieve specific contact
    router.get(
      '/:id',
      hooks.read,
      validateRecord,
      hooks.postRead || [],
      function (req, res, next) {
        let { record } = res.locals || {};

        return res.status(200).send(record);
      }
    );

    //   router.patch(
    //     '/:id',
    //     hooks.update,
    //     validateRecord,
    //     hooks.preUpdate || [],
    //     function (req, res, next) {
    //       let { record, data } = res.locals || {};
  
    //       service.update(record, data)
    //         .then((modified) => {
    //           res.locals.modifiedFields = modified;
    //           next();
    //         })
    //         .catch(next);
    //     },
    //     hooks.postUpdate || [],
    //     invalidateSearchCache,
    //     function(req, res) {
    //       let { record = {} } = res.locals || {};
    //       let resultData = {
    //         id: record._id
    //       }
    //       if (record.organizationId) {
    //         resultData.organizationId = record.organizationId
    //       }
    //       return res.status(200).send(dynamicMsg(success['recordUpdated'], [messageName], resultData));
    //     }
    //   );

    //     // Remove specific contact
    router.delete(
        '/:id',
        hooks.delete,
        validateRecord,
        hooks.preDelete || [],
        function (req, res, next) {
          let { record } = res.locals || {};
  
          service.delete(record)
            .then((result) => {
              next();
            })
            .catch(next);
        },
        hooks.postDelete || [],
        //invalidateSearchCache,
        function(req, res, next) {
          let { record } = res.locals || {};
          return res.status(200).send(dynamicMsg(success['recordDeleted'], [messageName], {id: record._id}));
        }
      );

      this.router = router;
}
 
module.exports = CrudRouter;