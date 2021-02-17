const responseUtils = require('../utils/responseUtils');

const Order = require("../models/order");
const { product } = require('puppeteer');

/**
 * Send all Orders as JSON
 *
 * @param {http.ServerResponse} response response to be sent back
 */
const getAllOrders = async response => {
  //10.1 Implement this

  const Orders = await Order.find({});
  
  return await responseUtils.sendJson(response, Orders);
};

/**
 * Send all Orders as JSON
 *
 * @param {http.ServerResponse} response response to be sent back
 */
const getCustomerOrders = async (response, user)=> {
    //10.1 Implement this
  
    const Orders = await Order.find({customerId: user._id});
    
    return await responseUtils.sendJson(response, Orders);
  };

/**
 * Create new Order and send created Order back as JSON
 *
 * @param {http.ServerResponse} response response to be sent back
 * @param {object} body JSON data from request body
 */
const createOrder = async (response, body, user) => {

    let valid = true;
    if(body.items.length === 0) {
      valid = false;
    }
    for (item of body.items) {
        if (item.quantity === undefined){
            valid = false;
        }
        if (item.product === undefined){
            valid = false;
            break
        }
        if(item.product._id === undefined){
            valid = false;
        }
        if(item.product.name === undefined){
            valid = false;
        }
        if (item.product.price === undefined){
            valid = false;
        }
    }
  
    if(!valid) {
      return responseUtils.badRequest(response, 'Invalid inputs');
    } else {
        body.customerId = user._id.toString();
      const newOrder = new Order(body);
      await newOrder.save();
      return await responseUtils.createdResource(response, newOrder);
    }
    
  }

/**
 * Get single order. If order is found but it is not the current users, return not found
 * @param {http.ServerResponse} response response to be sent back
 * @param {*} id: order id
 * @param {*} user: current user
 */

const getOrder = async (response, id, user)=> {

  const order = await Order.findById(id).exec();
  
  if(order === null) {
    return responseUtils.notFound(response);
  }
  if(user.role === 'admin') {
    return responseUtils.sendJson(response, order);
  }
  if(order.customerId !== user._id.toString()) {
    return responseUtils.notFound(response);
  }
  return responseUtils.sendJson(response, order);
};

module.exports = { getAllOrders, getCustomerOrders, createOrder, getOrder };
