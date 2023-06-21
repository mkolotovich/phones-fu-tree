const mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  login: String,
  id: String,
  token: String,
  expired: Boolean,
  visited: Boolean,
  created_on: { type: Number, default: Date.now() },
  link: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema)
module.exports = {
  User
};
