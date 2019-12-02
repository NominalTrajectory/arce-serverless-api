const mongoose = require('mongoose');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');

const ExerciseStatsSchema = new mongoose.Schema({
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
    }
});


const ExerciseStats = mongoose.model('ExerciseStats', ExerciseStatsSchema);
module.exports = ExerciseStats;
