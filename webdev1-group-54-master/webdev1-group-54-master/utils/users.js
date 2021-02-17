/**
 * Week 08 utility file for user related operations
 *
 * NOTE: This file will be abandoned during week 09 when a database will be used
 * to store all data.
 */

const { use } = require('chai');

/**
 * Use this object to store users
 *
 * An object is used so that users can be reset to known values in tests
 * a plain const could not be redefined after initialization but object
 * properties do not have that restriction.
 */
const data = {
  // make copies of users (prevents changing from outside this module/file)
  users: require('../users.json').map(user => ({ ...user })),
  roles: ['customer', 'admin']
};

/**
 * Reset users back to their initial values (helper function for tests)
 *
 * NOTE: DO NOT EDIT OR USE THIS FUNCTION THIS IS ONLY MEANT TO BE USED BY TESTS
 * Later when database is used this will not be necessary anymore as tests can reset
 * database to a known state directly.
 */
const resetUsers = () => {
  // make copies of users (prevents changing from outside this module/file)
  data.users = require('../users.json').map(user => ({ ...user }));
};

/**
 * Generate a random string for use as user ID
 * @returns {string} id as string
 */
const generateId = () => {
  const id = Math.random().toString(36).substr(2, 9);

  if(data.users.find(user => user.id === id)) {
    generateId();
  } else {
    return id;
  }
};

/**
 * Check if email is already in use by another user
 *
 * @param {string} email email input
 * @returns {boolean} if exists
 */
const emailInUse = email => {
  return data.users.find(user => user.email === email);
};

/**
 * Return user object with the matching email and password or undefined if not found
 *
 * Returns a copy of the found user and not the original
 * to prevent modifying the user outside of this module.
 *
 * @param {string} email email input
 * @param {string} password password input
 * @returns {object|undefined} found user or undefined
 */
const getUser = (email, password) => {
  // 8.3 Get user whose email and password match the provided values
  const user = data.users.find(u => u.email === email && u.password === password);
  if(user === undefined) {
    return user;
  }
  return {...user};
  
};

/**
 * Return user object with the matching ID or undefined if not found.
 *
 * Returns a copy of the user and not the original
 * to prevent modifying the user outside of this module.
 *
 * @param {string} userId user id to be searched
 * @returns {object|undefined} fround user or undefined
 */
const getUserById = userId => {
  // 8.3 Find user by user id
  const user = data.users.find(u => u._id === userId);
  if(user === undefined) {
    return user;
  }
  return {...user};
};

/**
 * Delete user by its ID and return the deleted user
 *
 * @param {string} userId user id to be deleted
 * @returns {object|undefined} deleted user or undefined if user does not exist
 */
const deleteUserById = userId => {
  // 8.3 Delete user with a given id
  const user = data.users.find(u => u._id === userId);
  if(user === undefined) {
    return user;
  }
  const userIndex = data.users.indexOf(user);
  data.users.splice(userIndex, userIndex);
  return {...user};
  //throw new Error('Not Implemented');
};

/**
 * Return all users
 *
 * Returns copies of the users and not the originals
 * to prevent modifying them outside of this module.
 *
 * @returns {Array<object>} all users
 */
const getAllUsers = () => {
  // 8.3 Retrieve all users
  return data.users.map(user => ({ ...user }));
};

/**
 * Save new user
 *
 * Saves user only in memory until node process exits (no data persistence)
 * Save a copy and return a (different) copy of the created user
 * to prevent modifying the user outside this module.
 *
 * DO NOT MODIFY OR OVERWRITE users.json
 *
 * @param {object} user new user to be saved
 * @returns {object} copy of the created user
 */
const saveNewUser = user => {
  // 8.3 Save new user
  // Use generateId() to assign a unique id to the newly created user.
  const id = generateId();
  const tempUser = {
    _id: id,
    name: user.name,
    email: user.email,
    password: user.password,
  };

  

  data.users = data.users.concat([tempUser]);
  updateUserRole(id, 'customer');
  return data.users.find(u => u._id === id);

};

/**
 * Update user's role
 *
 * Updates user's role or throws an error if role is unknown (not "customer" or "admin")
 *
 * Returns a copy of the user and not the original
 * to prevent modifying the user outside of this module.
 *
 * @param {string} userId updated users id
 * @param {string} role "customer" or "admin"
 * @returns {object|undefined} copy of the updated user or undefined if user does not exist
 * @throws {Error} error object with message "Unknown role"
 */
const updateUserRole = (userId, role) => {
  // 8.3 Update user's role
  if(role !== 'customer' && role !== 'admin') {
    throw new Error('Unknown role');
  }
  const user = data.users.find(u => u._id === userId);
  if(user === undefined) {
    return user;
  }
  user.role = role;
  return {...user, role: role};
  
};

/**
 * Validate user object (Very simple and minimal validation)
 *
 * This function can be used to validate that user has all required
 * fields before saving it.
 *
 * @param {object} user user object to be validated
 * @returns {Array<string>} Array of error messages or empty array if user is valid
 */
const validateUser = user => {
  // 8.3 Validate user before saving
  const errorMessages = [];
  if(!user.name) {
    errorMessages.push('Missing name');
  } 
  if(!user.password) {
    errorMessages.push('Missing password');
  }
  if(!user.email) {
    errorMessages.push('Missing email'); 
  }
  if(user.role !== 'customer' && user.role !== 'admin' && user.role !== undefined) {
    errorMessages.push('Unknown role');
  }

  return errorMessages;
};

module.exports = {
  deleteUserById,
  emailInUse,
  getAllUsers,
  getUser,
  getUserById,
  resetUsers,
  saveNewUser,
  updateUserRole,
  validateUser
};
