const mongoose = require('mongoose');

const sMessage = mongoose.Schema({
  to: { type: String, required: true },
  content: { type: String, required: true },
  from: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Message', sMessage);