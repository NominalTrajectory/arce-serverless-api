const mongoose = require('mongoose');

const arrayValidator = function(array) {
    return array.length > 0;
}

const exerciseSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,

    },
    position: {
        x: {
            type: Number,
            required: true
            
        },
        y: {
            type: Number,
            required: true
        },
        z: {
            type: Number,
            required: true
        }
    },
    rotation: {
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        },
        z: {
            type: Number,
            required: true
        },
        w: {
            type: Number,
            required: true
        }
    }
});


const tareaSchema = new mongoose.Schema({

    position: {
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        },
        z: {
            type: Number,
            required: true
        }
    },
    rotation: {
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        },
        z: {
            type: Number,
            required: true
        },
        w: {
            type: Number,
            required: true
        }
    },
    exercises: [exerciseSchema]
});

const LocationSchema = new mongoose.Schema({

    _id: {
        type: String,
        required: true
    },
    areas: {
        type: [tareaSchema],
        required: true,
        validate: [arrayValidator, "Must contain at least 1 training area"]
    }

}, {timestamps: true});



const Location = mongoose.model('Location', LocationSchema);
module.exports = Location;
