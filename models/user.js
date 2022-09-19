const mongoose = require('../config/mongoose')
const userSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.ObjectId,
        auto: true
      },
      name:{type:String},
      address: {
        line: { type: String },
        zipcode: { type: String },
        city: { type: String },
        state: { type: mongoose.Schema.ObjectId },
        stateCode: { type: String },
        country: { type: String },
        countryCode: { type: String }
      },
      email:{type:String},
      contactno:{type:Number},
      createdAt: { type: Date },
      updatedAt: { type: Date }
})
const User = mongoose.model('users',userSchema);
module.exports= { User }
