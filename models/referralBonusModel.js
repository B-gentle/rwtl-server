const mongoose = require('mongoose');

const referralBonusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
    },
    upline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    userLevel: {
        type: Number,
    },

    bonusAmount: {
        type: Number
    },

    pv: {
        type: Number
    }
}, {
    timestamps: true
});

const ReferralBonus = mongoose.model('ReferralBonus', referralBonusSchema);

module.exports = ReferralBonus;