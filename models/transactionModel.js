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
        enum: ['airtime', 'data', 'cableTv', 'exams', 'electricity', 'commissionTransfer', 'fundTransfer', 'upgrade', 'registration']
    },

    //export all the enums so as to avoid typos

    transactionCategory: {
        type: String
    },

    time: {
        type: Date,
        default: Date.now
    },

    commission: {
        type: Number,
        required: function () {
            return this.type === 'airtime' || this.type === 'data'
        }
    },

    status: {
        type: String
    },

    recipient: {
        type: String,
        ref: "User",
        required: function () {
            return this.type === 'fundTransfer'
        }
    },

    sender: {
        type: String
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

    meterNo: {
        type: String,
        required: function () {
            return this.type === 'electricity'
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

    ElectricCompany: {
        type: String,
        required: function () {
            return this.type === 'electricity'
        }
    },

    package: {
        name: {
            type: String,
            ref: 'Package'
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Package"
        },
    },

    registeredUser: {
        type: String,
    },

    amount: {
        type: Number,
        required: true
    },

    prevCommissionBalance: {
        type: Number,
        required: function () {
            return this.type === 'commissionTransfer'
        }
    },

    newCommissionBalance: {
        type: Number,
        required: function () {
            return this.type === 'commissionTransfer'
        }
    },

    prevWalletBalance: {
        type: Number,
        required: function () {
            return this.type === 'commissionTransfer'
        }
    },

    newWalletBalance: {
        type: Number,
        required: function () {
            return this.type === 'commissionTransfer'
        }
    },

    senderPrevWalletBalance: {
        type: Number,
        required: function () {
            return this.type === 'fundTransfer'
        }
    },

    senderNewWalletBalance: {
        type: Number,
        required: function () {
            return this.type === 'fundTransfer'
        }
    },

    receiverPrevWalletBalance: {
        type: Number,
        required: function () {
            return this.type === 'fundTransfer'
        }
    },

    receiverNewWalletBalance: {
        type: Number,
        required: function () {
            return this.type === 'fundTransfer'
        }
    },

}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;