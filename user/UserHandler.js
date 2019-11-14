const connectToDB = require('../db');
const UserProfile = require('../models/UserProfile');


// FUNCTIONS

// SAVE PROFILE

module.exports.saveProfile = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDB()
      .then(() => {
        const { name, age, gender, height, weight, fitnessLevel, fitnessGoal } = JSON.parse(event.body);
        UserProfile.create({ _id: event.requestContext.authorizer.principalId,
                             name: name,
                            age: age,
                            gender: gender,
                            height: height,
                            weight: weight,
                            fitnessLevel: fitnessLevel,
                            fitnessGoal: fitnessGoal })
        .then(userProfile => callback(null, {
            statusCode: 201,
            body: 'User profile saved'
        }))
        .catch(err => callback(null, {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type':'text/plain' },
            body: JSON.stringify(err.message)
        }));
    });
  };


// UPDATE PROFILE

// GET PROFILE
module.exports.getProfile = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return connectToDB()
    .then(() => 
        profile(event.requestContext.authorizer.principalId)
    )
    .then(profile => ({
        statusCode: 200,
        body: JSON.stringify(profile)
    }))
    .catch(err => ({
        statusCode: err.statusCode || 500,
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(err.message)
    }));
  };

// UPDATE PROFILE


// HELPERS
function profile(userId) {
    return UserProfile.findById(userId, { password: 0 })
      .then(profile =>
        !profile
          ? Promise.reject('No profile found.')
          : profile
      )
      .catch(err => Promise.reject(new Error(err)));
  }

