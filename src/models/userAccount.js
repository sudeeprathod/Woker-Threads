const mongoose = require('mongoose');

const UserAccountScehma = mongoose.Schema({
    userAccount: String
}, {
    timestamps: true
});

module.exports = mongoose.model('UserAccount', UserAccountScehma);
