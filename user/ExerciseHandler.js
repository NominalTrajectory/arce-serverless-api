const connectToDB = require('../db');
const UserActivity = require('../models/UserActivity');
const mongoose = require('mongoose');

/* 
FUNCTIONS
*/

// SAVE PERFORMED EXERCISES

module.exports.saveExercise = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDB()
      .then(() => {
        //const { name, age, gender, height, weight, fitnessLevel, fitnessGoal } = JSON.parse(event.body);
        UserActivity.findOneAndUpdate(
            { _id: event.requestContext.authorizer.principalId }, 
            { _id: event.requestContext.authorizer.principalId, $push: {exercises: JSON.parse(event.body)}}, 
            {upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true})
        .then(userActivity => callback(null, {
            statusCode: 201,
            body: 'User activity saved'
        }))
        .catch(err => callback(null, {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type':'text/plain' },
            body: JSON.stringify(err.message)
        }));
    });
  };


// GET PERFORMED EXERCISES

module.exports.getExercise = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return connectToDB()
    .then(() => 
        exercises(event.requestContext.authorizer.principalId)
    )
    .then(exercises => ({
        statusCode: 200,
        body: JSON.stringify(exercises.exercises)
    }))
    .catch(err => ({
        statusCode: err.statusCode || 500,
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(err.message)
    }));
  };


  /*
  HELPERS
  */

  function exercises(user_id) {
    return UserActivity.findOne(
        { "_id": user_id }, 
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0, 'exercises._id': 0 }
        )
    .then(exercises =>
      !exercises
        ? Promise.reject('No exercises found.')
        : exercises
    )
    .catch(err => Promise.reject(new Error(err)));
  }

  function exercisesByDate(user_id) {
    return UserActivity.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(user_id) }},
        { $project: {
            exercises: {$filter: {
                input: '$exercises',
                as: 'exercise',
                cond: {$eq: ['$$exercise.datePerformed', new Date("2019-12-02")]}
            }}
        }}
    ])
    .then(exercises =>
      !exercises
        ? Promise.reject('No exercises found.')
        : exercises
    )
    .catch(err => Promise.reject(new Error(err)));
  }


//   { $match: { _id: mongoose.Types.ObjectId(user_id) }},
//         { $unwind: '$exercises' },
//         { $match: {'exercises.sets': {$gte: 0}}},
//         { $group: {_id: '$_id', exercises: {$push: '$exercises.sets'}}}