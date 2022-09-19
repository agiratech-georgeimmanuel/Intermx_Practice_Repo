const express = require('express');
const mongoose = require('mongoose');

function crudRouter(model,hooks, Messagename = ""){
    const CrudService = require("../lib/crudService");
    const service = new CrudService(model);
    const router = express.Router();
}
