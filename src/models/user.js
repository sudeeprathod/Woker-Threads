const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    firstname: String,
    Dob: String,
    address: String,
    phoneNumber: String,
    state:  String,
    zipCode:  String,
    email:  String,
    gender: String,
    userType: String
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);