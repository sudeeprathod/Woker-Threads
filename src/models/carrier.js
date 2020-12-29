const mongoose = require('mongoose');

const CarrierScehma = mongoose.Schema({
    company_name: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Carrier', CarrierScehma);
