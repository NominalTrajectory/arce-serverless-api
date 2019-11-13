const connectToDB = require('../db');
const Account = require('../models/Account');
const UserProfile = require('../models/UserProfile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs-then');


/*
FUNCTIONS
*/

// REGISTER
module.exports.register = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return connectToDB()
    .then(() =>
        register(JSON.parse(event.body))
    )
    .then(session => ({
        statusCode: 201,
        body: JSON.stringify(session)
    }))
    .catch(err => ({
        statusCode: err.statusCode || 500,
        headers: { 'Content-Type': 'text/plain' },
        body: err.message
    }));
};

// LOGIN
module.exports.login = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return connectToDB()
    .then(() =>
      login(JSON.parse(event.body))
    )
    .then(session => ({
      statusCode: 200,
      body: JSON.stringify(session)
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(err.message)
    }));
};

// TEST GET ME
module.exports.me = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return connectToDB()
      .then(() =>
        me(event.requestContext.authorizer.principalId) // the decoded.id from the VerifyToken.auth will be passed along as the principalId under the authorizer
      )
      .then(session => ({
        statusCode: 200,
        body: JSON.stringify(session)
      }))
      .catch(err => ({
        statusCode: err.statusCode || 500,
        headers: { 'Content-Type': 'text/plain' },
        body: { stack: err.stack, message: err.message }
      }));
  };
  

/*
HELPERS
*/

// REGISTER

function signToken(account) {
    const token =  jwt.sign({ user_id: account._id, role: account.role }, process.env.JWT_SECRET, {
      expiresIn: '730d' // expires in 2 years
    });
    const { iat, exp } = jwt.decode(token);
    return { iat, exp, token };
  }
  
  function checkIfInputIsValid(eventBody) {
    if (
      !(eventBody.password &&
        eventBody.password.length >= 6)
    ) {
      return Promise.reject(new Error('Password error. Password needs to be longer than 6 characters.'));
    }
  
  
    if (
      !(eventBody.email)
    ) return Promise.reject(new Error('Email error. Email must have valid characters.'));
  
    return Promise.resolve();
  }
  
  function register(eventBody) {
    return checkIfInputIsValid(eventBody) // validate input
      .then(() =>
        Account.findOne({ email: eventBody.email }) // check if account exists
      )
      .then(account =>
        account
          ? Promise.reject(new Error('Account with this email already exists.'))
          : bcrypt.hash(eventBody.password, 8) // hash the pass
      )
      .then(hash =>
        Account.create({ email: eventBody.email, password: hash }) 
        // create the new user
      )
      .then(account => (signToken(account))); 
      // sign the token and send it back
  }

  // LOGIN
  function login(eventBody) {
    return Account.findOne({ email: eventBody.email })
      .then(account =>
        !account
          ? Promise.reject(new Error('Authentication failed'))
          : comparePassword(eventBody.password, account.password, account)
      )
      .then(token => (token));
  }
  
  function comparePassword(eventPassword, userPassword, account) {
    return bcrypt.compare(eventPassword, userPassword)
      .then(passwordIsValid =>
        !passwordIsValid
          ? Promise.reject(new Error('Authentication failed'))
          : signToken(account)
      );
  }
