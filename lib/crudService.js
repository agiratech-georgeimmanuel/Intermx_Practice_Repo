
const { falt } = require("./flat");
const { diff } = require("deep-object-diff");

const isObject = (x) => {
  return typeof x === 'object' && x !== null
}

const isArray = (x) => {
  return Array.isArray(x)
}

const isUndefined = (x) => {
  return x === undefined
}

function CrudService(model) {
    this.model = model
}

const omitUndefined = function(data) {
  for (const [key, value] of Object.entries(data)) {
    if(isObject(value) && isArray(value)) {
      data[key] = value.map(y => omitUndefined(y));
    } else if(isObject(value)) {
      data[key] = omitUndefined(value)
      if (Object.keys(data[key]).length === 0) {
        if (key != 'createdAt') delete data[key];
      }
    } else if(value === undefined) {
      delete data[key];
    }
  }

  return data;
} 

const resetEmptyString = function(data) {
  for (const [key, value] of Object.entries(data)) {
    if(isObject(value) && isArray(value)) {
      data[key] = value.map(y => resetEmptyString(y));
    } else if(isObject(value)) {
      data[key] = resetEmptyString(value)
      if (Object.keys(data[key]).length === 0) {
        if (key != 'createdAt') delete data[key];
      }
    } else if(value === "") {
      data[key] = null
    }
  }

  return data;
}


CrudService.prototype.create = function(data) {
    //data = resetEmptyString(data);
    return new Promise(async (resolve, reject) => {
      this.model.create(data, (err, result) => {
        if(err) reject(err)
        resolve(result)
      });
    });
  }

  CrudService.prototype.count = function(query) {
    return new Promise((resolve, reject) => {
      this.model.countDocuments(query)
        .then(resolve)
        .catch(reject);
    });
  }

  CrudService.prototype.list = function({
    query = {},
    pagination,
    projection = {},
    populate = [],
    sort = {}
  }) {
    return new Promise((resolve, reject) => {
      this.model.find(query, projection)
      .collation({locale: "en"})
      .populate(populate)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .then(resolve)
      .catch(reject);
    });
  }

  CrudService.prototype.read = function({
    query,
    projection = {},
    populate = []
  }) {
    return new Promise(async (resolve, reject) => {
      this.model.findOne(query,projection)
        .populate(populate)
        .then((result) => {
          if(!result) {
            let error = new Error("Not Found");
            error.status = 400;
            
            reject(error)
          } else {
            resolve(result)
          }        
        })
        .catch(reject);
    });
  }

  CrudService.prototype.update = function(model, data) {
    let { createdAt, ...other } = data;
    
    other = omitUndefined(other);
    other = resetEmptyString(other);
    let modified = omitUndefined(diff(JSON.parse(JSON.stringify(model)), data));
  
    return new Promise(async (resolve, reject) => {
      this.model.updateOne({
        _id: model._id
      }, falt(other))
        .then(() => {
          resolve(modified)
        })
        .catch(reject);
    });
  }

  CrudService.prototype.delete = function(model) {
    let query = {
      _id: model._id
    }
    return new Promise((resolve, reject) => {
      this.model.deleteOne(query)
        .then(resolve)
        .catch(reject);
    })
  }
  
  module.exports = CrudService;