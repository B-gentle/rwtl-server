const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema({
  message: {
    type: String,
    required: [true, "Please Add A Name"],
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