const responseUtils = require('../utils/responseUtils');

// require user model
const User = require("../models/user");

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response response to be sent back
 */
const getAllUsers = async response => {
  //10.1 Implement this
  
  //8.3 Return all users as JSON
  const users = await User.find({});

  return responseUtils.sendJson(response, users);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response response to be sent back
 * @param {string} userId deleted users id
 * @param {object} currentUser (mongoose document object)
 */
const deleteUser = async (response, userId, currentUser) => {
  // 10.1 Implement this
  if(userId === currentUser._id.toString()) {
    return responseUtils.badRequest(response, 'Deleting own data is not allowed');
  }
  const deleted = await User.findOneAndRemove({ _id: userId});
  if(deleted === null) {
    return responseUtils.notFound(response);
  } else {
    return responseUtils.sendJson(response, deleted);
  }
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response response to be sent back
 * @param {string} userId updated users id
 * @param {object} currentUser (mongoose document object)
 * @param {object} userData JSON data from request body
 */
const updateUser = async (response, userId, currentUser, userData) => {
  // 10.1 Implement this
  if(userId === currentUser._id.toString()) {
    return responseUtils.badRequest(response, 'Updating own data is not allowed');
  }
  let valid = true;      
  if(userData.role === undefined || (userData.role !== 'customer' && userData.role !== 'admin')) {
    valid = false;
  }

  if(!valid) {
    return responseUtils.badRequest(response, 'Missing inputs');
  } 
  // updating an existing user
  const existingUser = await User.findById(userId).exec();
  if(existingUser === null) {
    return responseUtils.notFound(response);
  } 
  // change user's role
  existingUser.role = userData.role;
  await existingUser.save();  
  return responseUtils.sendJson(response, existingUser);
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response response to be sent back
 * @param {string} userId viewed users id
 * @param {object} currentUser (mongoose document object)
 */
const viewUser = async (response, userId, currentUser) => {
  // 10.1 Implement this

  const user = await User.findById(userId).exec();
  if(user === null) {
    return responseUtils.notFound(response);
  }
  return responseUtils.sendJson(response, user);
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response response to be sent back
 * @param {object} userData JSON data from request body
 */
const registerUser = async (response, userData) => {
  // 10.1 Implement this
  let valid = true;
  let emailIsValid = false;
  if(userData.name === undefined) {
    valid = false;
  }
  if(userData.email === undefined) {
    valid = false;
  } else {
    const emailInUse = await User.findOne({email: userData.email}).exec();
    if(!(emailInUse === null)){
      valid = false;
    }
    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    emailIsValid = emailRegex.test(userData.email);
  }
  if(userData.password === undefined) {
    valid = false;

  } else {
    if(userData.password.length < 10) {
      valid = false;
    }
  }
  

  

  userData.role = "customer";

  if(!valid || !emailIsValid) {
    return responseUtils.badRequest(response, 'Invalid inputs');
  } else {
    const newUser = new User(userData);
    await newUser.save();
    return responseUtils.createdResource(response, newUser);
  }
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };
