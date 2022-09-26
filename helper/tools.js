const vsprintf = require("sprintf-js").vsprintf;
const request = require("request");
const lodash = require("lodash");
const numeral = require("numeral");
let { error } = require('../config/messages');
const mongoose = require('mongoose');
const DateOnly = require('dateonly');









module.exports ={

    dynamicMsg: (message, value, data) => {
        let responseMessage = {};
        responseMessage['status'] = message['status'];
        responseMessage['code'] = message['code'];
        responseMessage['api-message'] = vsprintf(message['api-message'], value);
        responseMessage['message'] = vsprintf(message['message'], value);
        if (data) responseMessage['data'] = data;
        return responseMessage;
      },
      catchErrorResponse: function (res, err) {
        console.error(`[${new Date().toUTCString()}]`, JSON.stringify(err));
        let errMsg;
        let errName;
        if (err.hasOwnProperty("error")) {
          if (err.error.hasOwnProperty("name")){
            errName = err.error.name;
            errMsg = err.error.message;
          } else {
            errMsg = err.error;
          }
        } else if (err.hasOwnProperty("message")){
          errMsg = err.message;
        } else if (err.hasOwnProperty("stack")){
          errMsg = err.stack;
        } else {
          errMsg = 'IntermxInternalApiError';
        }
    
        if (err.statusCode) {
          if(err.statusCode === 401){
            res.setHeader('WWW-Authenticate', 'Bearer Token Not Valid');
            res.status(401).send(this.dynamicMsg(error['InvalidBearerToken'], [errMsg]));
          } else {
            res.status(err.statusCode).send(this.dynamicMsg(error['authenticationError'], [errName || errMsg]));
          }
        } else {
          res.status(500).send(this.dynamicMsg(error['IntermxInternalApiError'], [errMsg]));
        }
      },

 formatMessage: (msg, err, customAttributeNames = {}) => {
    if (msg && msg.message) {
      let field = Object.keys(err.errors)[0];
      msg.message = msg.message.replace(field, lodash.startCase(field));

      if(msg.message.indexOf(":attribute") !== -1) {
        if(customAttributeNames[field]) {
          msg.message = msg.message.replace(`:attribute`, customAttributeNames[field]);
        } else {
          msg.message = msg.message.replace(`:attribute`, field);
        }
      }
    }
    return msg;
  }
}