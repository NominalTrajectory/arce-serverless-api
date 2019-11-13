const mongoose = require('mongoose');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');
const AccountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: 'Email address is required',
        lowercase: true,
        validate: [validator.isEmail, 'Provide a valid email address'],
        unique: true,
        uniqueCaseInsensitive: true

    },
    password: {
        type: String,
        required: 'Password is required'
    },
    role: {
        type: Number,
        default: 111
    }
});

AccountSchema.plugin(uniqueValidator, { message: 'Email already in use'});

const Account = mongoose.model('Account', AccountSchema);
module.exports = Account;
