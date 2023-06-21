const mongoose = require('mongoose');

var administrationSchema = mongoose.Schema({
  location: String,
  phone_code: String,
  email: String,
  authority: [],
  management: []
});

const Phone = mongoose.models.Phone || mongoose.model('Phone', administrationSchema)

module.exports = {
  Phone,
};
