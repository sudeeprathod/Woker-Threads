const mongoose = require('mongoose');

const LOBScehma = mongoose.Schema({
    category_name: String
}, {
    timestamps: true
});

module.exports = mongoose.model('LOB', LOBScehma);
