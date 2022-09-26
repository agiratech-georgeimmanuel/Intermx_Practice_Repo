const mongoose = require('mongoose');








const defaultExistCheckQuery = (req, res) => {
    let { siteInfo } = res.locals;
  
    let existCheckQuery = {
      siteId: mongoose.Types.ObjectId(siteInfo._id),
      deletedAt: null
    };
    if (req.params.id) {
      existCheckQuery["_id"] = {
        $ne: req.params.id
      }
    }
  
    return existCheckQuery
  }
  module.exports = {defaultExistCheckQuery}