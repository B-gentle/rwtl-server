const mongoose = require('mongoose');

const qualifiedUsersSchema = new mongoose.Schema({
    incentiveName: {
      type: String,
      required: true,
      ref: "Incentives"
    },
  
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Users"
    },

    username:{
        type: String,
        ref: "User"
    },

    currentMonth:{
        type: Number,
        required: true
    }
    
  });
  
  const QualifiedUser = mongoose.model('QualifiedUser', qualifiedUsersSchema);
  
  module.exports = QualifiedUser;