const mongoose = require('../config/mongoose')
const userSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.ObjectId,
        auto: true
      },
      name:{type:String},
      parentUser: { type: mongoose.Schema.ObjectId, ref: 'User' },
      address: {
        line: { type: String },
        zipcode: { type: String },
        city: { type: String },
        state: { type: String }
      },
      email:{type:String},
      createdAt: { type: Date },
      updatedAt: { type: Date }},
      {
        timestamps: true,
        versionKey: false,
        toJSON: { getters: true },
        toObject: { getters: true }
      }
)
const User = mongoose.model('users',userSchema);
module.exports= { User }
