var mongoose = require('mongoose');

/**
* @type {mongoose.SchemaDefinitionProperty}
*/
const schema = mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Please include an email.'],
            unique: true
        },
        username: {
            type: String,
            required: [true, 'Please include a username.'],
        },
        first_name: {
            type: String,
            required: [true, 'Please include a first name.']
        },
        last_name: {
            type: String,
            required: [true, 'Please include a first name.']
        },
        password: {
            type: String,
            required: [true, 'Please include a password.']
        },
        companyIds: [{
            type: String,
            required: true
        }]
    },
    {
        timestamps: true
    },
    {
        collection: 'users'
    }
);

module.exports = mongoose.model('User', schema);