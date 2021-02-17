const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // 9.4 Implement this
  name: {
    type: String,
    maxlength: 50,
    trim: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailRegex.test(v);
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 10,
    trim: true,
    set: doHash,
  },
  role: {
    type: String,
    trim: true,
    lowercase: true,
    enum: ['admin', 'customer'],
    default: 'customer',
  },
});


/**
 * Hash the given password if it passes validation.
 * Return hash
 * @param {*} orig : original password
 */
function doHash(orig) {
  if(orig.length < 10 || orig === undefined || orig === null) {
    return orig;
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(orig, salt);
  return hash;
}

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password given password
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = async function (password) {
  //9.4
  if(password.length <10 || password === undefined || password === null) {
    return false;
  }
  return await bcrypt.compare(password, this.password);
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;
