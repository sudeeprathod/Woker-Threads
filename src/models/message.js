const mongoose = require('mongoose');

const MessageScehma = mongoose.Schema({
    message: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', MessageScehma);
