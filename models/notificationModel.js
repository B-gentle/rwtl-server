const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema({
  title: {
    type: String,
    default: 'New Notification'
  },

  message: {
    type: String,
    required: [true, "Please Add A Message"],
  },

  status: {
    type: Boolean,
    default: false
  },

  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

}, {
  timestamps: true
});

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;