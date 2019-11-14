const connectToDB = require('../db');
const Location = require('../models/Location');

// FUNCTIONS

// SAVE LOCATION
module.exports.saveLocation = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDB()
      .then(() => {
        Location.findOneAndUpdate({_id:event.pathParameters.id}, JSON.parse(event.body), {upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true})
        .then(location => callback(null, {
            statusCode: 201,
            body: 'Location Saved'
        }))
        .catch(err => callback(null, {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type':'text/plain' },
            body: JSON.stringify(err.message)
        }));
    });
  };

// GET LOCATION
module.exports.getLocation = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return connectToDB()
    .then(() => 
        location(event.pathParameters.id)
    )
    .then(location => ({
        statusCode: 200,
        body: JSON.stringify(location)
    }))
    .catch(err => ({
        statusCode: err.statusCode || 500,
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(err.message)
    }));
  };

  function location(id) {
    return Location.findById(id)
    .then(location =>
      !location
        ? Promise.reject('No location found.')
        : location
    )
    .catch(err => Promise.reject(new Error(err)));
  }

