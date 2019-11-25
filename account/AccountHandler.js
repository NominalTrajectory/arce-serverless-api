const connectToDB = require('../db');
const Account = require('../models/Account');
const bcrypt = require('bcryptjs-then');

/*
FUNCTIONS
*/

// CHANGE PASSWORD
module.exports.newPwd = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDB()
      .then(() => {
        const { currentPwd, newPwd } = JSON.parse(event.body);
        changePassword(event.requestContext.authorizer.principalId, currentPwd, newPwd)
        .then(account => callback(null, {
            statusCode: 200,
            body: 'Password successfully changed'
        }))
        .catch(err => callback(null, {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type':'text/plain' },
            body: JSON.stringify(err.message)
        }));
    });
  };


// RESET PASSWORD (EMAIL)


/*
HELPERS
*/

function changePassword(id, currentPwd, newPwd) {
    return Account.findOne({_id:id})
    .then(account =>
        !account
          ? Promise.reject(new Error('Account error'))
          : bcrypt.compare(currentPwd, account.password)
      )
    .then(passwordIsValid =>
        !passwordIsValid
          ? Promise.reject(new Error('Current password is invalid'))
          : formatOk(newPwd)
      )
    .then(formatOk =>
        !formatOk
            ? Promise.reject(new Error('Password must be at least 6 characters long.'))
            : bcrypt.hash(newPwd, 8)
    )
    .then(hash =>
        Account.findOneAndUpdate({_id:id}, {password:hash}));       
  }


function formatOk(newPwd) {
    if (newPwd.length < 6) {
        return false;
      }
      return true;
}