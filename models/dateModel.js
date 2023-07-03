const mongoose = require('mongoose');

const dateSchema = new mongoose.Schema({
  Day: {
    type: Number,
    required: true,
  },

  Month:{
      type: Number,
      required: true
  },

  Year:{
    type: Number,
    required: true
},
   
});

const CurrentDate = mongoose.model('CurrentDate', dateSchema);

module.exports = CurrentDate;
