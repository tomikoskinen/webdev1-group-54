const mongoose = require('mongoose');
/**
 * Get database connect URL.
 *
 * Reads URL from DBURL environment variable or
 * returns default URL if variable is not defined
 *
 * @returns {string} connection URL
 */
const DEFAULT_URL = "mongodb://localhost:27017/WebShopDb";

const getDbUrl = () => {
  // TODO: 9.3 Implement this
  //Trying to fix error: AssertionError: expected undefined to equal 'mongodb://localhost:27017/WebShopDb'
  //testcase: must return default database URL if DBURL is not defined
  if (process.env.DBURL){
    return process.env.DBURL;
  }
  //const result = require('dotenv').config();
  return DEFAULT_URL;
  
};

function connectDB () {
  // Do nothing if already connected
  if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(getDbUrl(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true
      })
      .then(() => {
        mongoose.connection.on('error', err => {
          console.error(err);
        });

        mongoose.connection.on('reconnectFailed', handleCriticalError);
      })
      .catch(handleCriticalError);
  }
}

function handleCriticalError (err) {
  console.error(err);
  throw err;
}

function disconnectDB () {
  mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, getDbUrl };
