const mongoose = require('mongoose');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');

const exerciseStatsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    timePerformed: {
        type: Number,
        required: true
    },
    datePerformed: {
        type: Date,
        required: true
    },
    sets: {
        type: Number,
        required: true
    },
    reps: {
        type: Number,
        required: true
    },
    weights: {
        type: Number,
        required: true
    },
    calories: {
        type: Number,
        required: true
    }
});

const UserActivitySchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    exercises: {
        type: [exerciseStatsSchema],
        required: true
    }
}, {timestamps: true});


const UserActivity = mongoose.model('UserActivity', UserActivitySchema);
module.exports = UserActivity;
