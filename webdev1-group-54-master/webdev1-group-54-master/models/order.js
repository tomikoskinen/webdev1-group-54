const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const orderedItem = new Schema({
  product: {
    _id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String
    }
  },
  quantity:{
    required: true,
    type: Number,
    min: 1
  }
});

const orderSchema = new Schema({
  customerId: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    of: orderedItem,
    required: true,
    minlength: 1
  }
});





// Omit the version key when serialized to JSON
orderSchema.set('toJSON', { virtuals: false, versionKey: false });
orderedItem.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;