const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  //v__:{
  //    type: Number
  //},
  //_id:{
   // type: String,
  //},
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    min: 0,
    required: true
  },
  image: {
    type: String
  },
  description: {
    type: String
  }
  
  
});





// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const Product = new mongoose.model('Product', userSchema);
module.exports = Product;
