const connectToDB = require('../db');
const Account = require('../models/Account');
const UserProfile = require('../models/UserProfile');
const bcrypt = require('bcryptjs-then');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const jwt = require('jsonwebtoken');






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
module.exports.resetPwd = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  connectToDB()
    .then(() => {
    
      const { email } = JSON.parse(event.body);
      resetPassword(email)
      .then(token => {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "no.reply.ar.gym@gmail.com",
          pass: "arceadmin"
        }
      });
    
      let mailOptions = {
        from: '"AR Gym No-Reply" <no.reply.ar.gym@gmail.com>',
        to: email,
        subject: "Password help has arrived!",
        html: `<h3>Dear user,</h3> 
        <p>You requested for a password reset, please use this <a href="http://localhost/account/reset_password/${token}">link</a> to reset your password</p> 
        <br> 
        <p>Cheers!</p>`
    }

    transporter.sendMail(mailOptions, function(error, info){
      if(error) {
        callback(null, {
          statusCode: 500,
          body: JSON.stringify(error)
      });
      }
      callback(null, {
        statusCode: 200,
        body: 'Check your email for further instructions'
    });
    })
  })
  .catch(err => callback(null, {
    statusCode: err.statusCode || 500,
    headers: { 'Content-Type':'text/plain' },
    body: JSON.stringify(err.message)
}));
  });
};

// DEACTIVATE AN ACCOUNT

// DELETE AN ACCOUNT AND USER PROFILE
module.exports.delete = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDB()
      .then(() => {
        const { currentPwd } = JSON.parse(event.body);
        deleteAccount(event.requestContext.authorizer.principalId, currentPwd)
        .then(account => callback(null, {
            statusCode: 200,
            body: 'Account deleted'
        }))
        .catch(err => callback(null, {
            statusCode: err.statusCode || 500,
            headers: { 'Content-Type':'text/plain' },
            body: JSON.stringify(err.message)
        }));
    });
  };
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

function deleteAccount(id, currentPwd) {
    return Account.findOne({_id:id})
    .then(account =>
    !account
    ? Promise.reject(new Error('Account error'))
    : bcrypt.compare(currentPwd, account.password)
    )
    .then(passwordIsValid =>
    !passwordIsValid
    ? Promise.reject(new Error('Current password is invalid'))
    : Account.findOneAndDelete({_id:id})
    )
    .then(
        UserProfile.findOneAndDelete({_id:id})
    );
}

function signToken(account) {
  const token =  jwt.sign({ user_id: account._id, role: account.role }, process.env.JWT_SECRET, {
    expiresIn: '730d' // expires in 2 years
  });
  return token;
}

function resetPassword(email) {
  return Account.findOne({ email: email })
  .then(account => 
    !account
    ? Promise.reject(new Error('No account found with this email address.'))
    : signToken(account)
    )
}

function sendEmail(email, token) {
  
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "no.reply.ar.gym@gmail.com",
      pass: "arceadmin"
    }
  });

  let mailOptions = {
    from: '"AR Gym No-Reply" <no.reply.ar.gym@gmail.com>',
    to: email,
    subject: "Password help has arrived!",
    html: `<h3>Dear user,</h3>`
}

  transporter.sendMail(mailOptions)
  .then((info) => {
    console.log(info);
  });
}