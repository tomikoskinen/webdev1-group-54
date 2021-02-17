const responseUtils = require('../utils/responseUtils');
const { getProducts } = require('../utils/products');

const Product = require("../models/product");

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response response to be sent back
 */
const getAllProducts = async response => {
  //10.1 Implement this

  const products = await Product.find({});
  
  return await responseUtils.sendJson(response, products);
};

/**
 * Create new product and send created product back as JSON
 *
 * @param {http.ServerResponse} response response to be sent back
 * @param {object} body JSON data from request body
 */
const createProduct = async (response, body) => {
    const newProduct = new Product(body);
    await newProduct.save();
    return await responseUtils.createdResource(response, newProduct);
  }

/**
 * Get one product
 * @param {*} response response to be sent back
 * @param {*} id the id of the product to be found
 */
const getProduct = async (response, id) => {
  const product = await Product.findById(id).exec();
  if(product === null) {
    return responseUtils.notFound(response);
  }
  return responseUtils.sendJson(response, product);
}

/**
 * Delete product
 * @param {*} response response to be sent back
 * @param {*} id: the id of the deleted product
 */

const deleteProduct = async (response, id) => {
  const deleted = await Product.findOneAndRemove({ _id: id});
  if(deleted === null) {
    return responseUtils.notFound(response);
  } else {
    return responseUtils.sendJson(response, deleted);
  }
}

/**
 * Update product
 * @param {*} response response to be sent back
 * @param {*} id: the id of the product to be updated
 * @param {*} data: update data 
 */

const updateProduct = async (response, id, data) => {
  let valid = true;      
  if(data.name === undefined || isNaN(data.price) || data.price === 0 || data.price <= 0) {
    valid = false;
  }
  
  if(!valid) {
    return responseUtils.badRequest(response, 'Missing inputs');
  } 
  // updating an existing product
  const existingProduct = await Product.findById(id).exec();
  if(existingProduct === null) {
    return responseUtils.notFound(response);
  } 
  
  existingProduct.name = data.name;
  existingProduct.price = data.price;
  if(data.description !== undefined) {
    existingProduct.description = data.description;
  }
  if(data.image !== undefined) {
    existingProduct.image = data.image;
  }
  
  await existingProduct.save();  
  
  return responseUtils.sendJson(response, existingProduct);
};


module.exports = { getAllProducts, createProduct, getProduct, deleteProduct, updateProduct };
