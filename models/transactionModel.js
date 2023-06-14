const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },

    transactionId: {
        type: String,
        required: [true, "Please add a transaction ID"]
    },

    transactionType: {
        type: String,
        required: true,
        enum: ['airtime', 'data', 'cableTv', 'exams', 'transfer']
    },

    transactionCategory: {
        type: String
    },

    time: {
        type: Date,
        default: Date.now
    },

    commission: {
        type: Number,
        required: function(){
            return this.type === 'airtime' || this.type === 'data'
        }
    },

    status: {
        type: String
    },

    recipient: {
        type: String,
        required: function() {
            return this.type === 'transfer'
        }
    },

    phoneNumber: {
        type: String,
        required: function () {
            return this.type === 'airtime' || this.type === 'data'
        }
    },
    IUC: {
        type: String,
        required: function () {
            return this.type === 'cableTv'
        }
    },
    network: {
        type: String,
        required: function () {
            return this.type === 'airtime' || this.type === 'data'
        }
    },
    cableCompany: {
        type: String,
        required: function () {
            return this.type === 'cableTv'
        }
    },

    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;