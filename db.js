const mongoose = require('mongoose');
let connected;

module.exports = connectToDB = () => {
    if (connected) {
        console.log('=> using existing database connection to MongoDB Atlas instance');
        return Promise.resolve();
    }

    console.log('=> using new database connection to MongoDB Atlas instance');
    return mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then (db => {
        connected = db.connections[0].readyState;
    });
};