const mongoose = require('mongoose');

const PolicySchema = mongoose.Schema({
    policy_number: String,
    policy_start_date: String,
    policy_end_date: String,
    policy_category_name: String,
    agency_id:  String,
    userID:  String
}, {
    timestamps: true
});

module.exports = mongoose.model('Policy', PolicySchema);
