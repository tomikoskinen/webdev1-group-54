const { getCredentials } = require("../utils/requestUtils");
const User = require("../models/user");
const bcrypt = require('bcryptjs');

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request incoming request
 * @returns {object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // 8.4 Implement getting current user based on the "Authorization" request header
  // NOTE: You can use getCredentials(request) function from utils/requestUtils.js
  // and getUser(email, password) function from utils/users.js to get the currently
  // logged in user

  // 9.5 use to user model from models/user.js
  const creds = getCredentials(request);
  if(creds === null){
    return null;
  }
  
  const user = await User.findOne({ email: creds[0]}).exec();
  if(user === null){
    return null;
  }else if(await user.checkPassword(creds[1])){
    return user;
  } else{
    return null;
  }
};

module.exports = { getCurrentUser };
