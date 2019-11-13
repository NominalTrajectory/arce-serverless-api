const mongoose = require('mongoose');
const UserProfileSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true,
    },
    fitnessLevel: {
        type: String,
        required: true
    },
    fitnessGoal: {
        type: String,
        required: true
    }
});


const UserProfile = mongoose.model('UserProfile', UserProfileSchema);
module.exports = UserProfile;
