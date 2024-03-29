const User = require('../models/user');
const classRoom = require('../models/classRoom');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const async = require("async");
const { cloudinary } = require("../cloudinary");
const {
  isLoggedIn,
  isAuthor,
  validateAnalysis,
  verifyToken,
  randString
} = require('../middleware');

// you need to add facebook and google here
module.exports.register = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      res.json({
        success: false,
        message: "email or password missing"
      })
    } else {
      const uniqueString = randString();
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        uniqueString: uniqueString,
        strategy: req.body.strategy,
        telephone: req.body.telephone,
        
      });
      await newUser.save().then(() => {
        const token = jwt.sign(newUser.toJSON(), process.env.SECRETJWT, {
          expiresIn: 604800 // 1 week
        });
        const smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.MAILUSER,
            pass: process.env.MAILPASS
          },
          secure: true
        });
        let mailOptions = {
          to: newUser.email,
          from: process.env.MAILUSER,
          subject: 'Verify new Account',
          text: 'Please click on the following link to verify your account: \n\n' +
            // add https to this and o the nuxt app home page and change the url
            'https://ceduconsult.herokuapp.com/users/verify/' + uniqueString + '\n\n'
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          if (err) {
            console.log(err);
          } else {
            res.json({
              success: true,
              message: "New account has been saved! verification link sent"
            })
            console.log('mail sent');
            // req.flash('success', 'An e-mail has been sent to ' + newUser.email + ' with further instructions.');
          }
        });

      }).catch((err) => {
        //When there are errors We handle them here
        console.log(err);
        res.json({
          success: false,
          message: "Couldn't create new account!"
        })

    });;
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Your account could not be saved. Error: ",
      err
    })
  }
}

// registerSocial end point
module.exports.registerSocial = async (req, res) => {
  try {
    if (!req.body.email || await User.findOne({
        email: req.body.email
      })) {
      res.json({
        success: false,
        message: "email is missing or user exist"
      })
    } else {
      let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        strategy: req.body.strategy,
        telephone: req.body.telephone,
        isVerified: true
      }, (err) => {
        if (err) console.log(err);
      });
      await newUser.save().then(() => {
        res.json({
          success: true,
          message: "Your account has been saved",
          newUser: newUser
        })
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Your account could not be saved. Error: ",
      err
    })
  }
}

module.exports.getVerified = async (req, res) => {
  try {
    const userFound = await User.findById(req.params.id)
    const smtpTransport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS
      },
      secure: true
    });
    const mailOptions = {
      to: userFound.email,
      from: process.env.MAILUSER,
      subject: 'Verify Account Request',
      text: 'Please click on the following link to verify your account: \n\n' +
        // add https to this and o the nuxt app home page and change the url
        'https://ceduconsult.herokuapp.com/users/verify/' + userFound.uniqueString + '\n\n'
    };
    smtpTransport.sendMail(mailOptions, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.json({
          success: true,
          message: "Your account has been saved"
        })
        console.log('mail sent');
        // req.flash('success', 'An e-mail has been sent to ' + newUser.email + ' with further instructions.');
      }
    });
  } catch(err){
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Your account could not be saved. Error ",
      err
    })
  }
}

module.exports.emailVerify = async (req, res) => {
  const {
    uniqueString
  } = req.params;
  // check is there anyone with the same string
  const user = await User.findOne({
    uniqueString: uniqueString
  })
  if (user) {
    // if there is one verify them
    user.isVerified = true
    let token = jwt.sign(user.toJSON(), process.env.SECRETJWT, {
      expiresIn: 604800 // 1 week
    });
    await user.save()
    // redirect to login page
    res.json({
      success: true,
      token: token,
      message: "verified"
    })
  } else {
    res.status(500).json({
      success: false,
      message: "Error occured when verifing your account ",
    })
  }
}

// login
module.exports.login = async (req, res) => {
  try {
    const foundUser = await User.findOne({
      email: req.body.email
    });
    if (!foundUser || !req.body.password) {
      res.json({
        success: false,
        message: "User not found!"
      })
    } else {
      if (foundUser.comparePassword(req.body.password)) {
        let token = jwt.sign(foundUser.toJSON(), process.env.SECRETJWT, {
          expiresIn: 604800 // 1 week
        })
        res.json({
          success: true,
          message: "Authentication successful",
          token: token
        });
      } else {
        res.status(403).json({
          success: false,
          message: 'Authentication faild, Email or password wrong'
        })
      }
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

// updating profile
module.exports.updateUser = async (req, res) => {
  try {
    console.log(req.body)
    const foundUser = await User.findByIdAndUpdate(req.params.id);
      foundUser.username = req.body.username;
      foundUser.email = req.body.email;
      foundUser.telephone = req.body.phone;
      foundUser.studentStatus = req.body.studentStatus;
      await foundUser.save();
      res.json({
        success: true,
        foundUser: foundUser,
        message: "Successfully updated"
      })
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

module.exports.updateUserAvatar = async (req, res) => {
  try{
    const foundUser = await User.findByIdAndUpdate(req.params.id);
    foundUser.avatar = {url: req.files.avatar[0].path, filename: req.files.avatar[0].filename };
    if (req.body.oldAvatar){
      await cloudinary.uploader.destroy(req.body.oldAvatar, {invalidate: true, resource_type: "raw"}, function(error,result) {
        console.log(result, error) });
    }
    res.json({
      success: true,
      message: "Successfully updated"
    })
    await foundUser.save();
  } catch(err){
    res.sendStatus(500)
  }
}

// upload documents to the cloud and add it to the list of the student

// delete document from the cloud and remove it from the student


// reset password
module.exports.requestReset = (req, res, next) => {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({
        email: req.body.email
      }, function (err, user) {
        if (!user || req.body.email === null || user.strategy != "local") {
          res.json({
            success: false,
            message: "No account with that email address exists."
          })
        } else {
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            done(err, token, user);
          });
        }
      });
    },
    function (token, user, done) {
      const smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.MAILUSER,
          pass: process.env.MAILPASS
        },
      });
      const mailOptions = {
        to: user.email,
        from: process.env.MAILUSER,
        subject: 'Password Reset',
        // dont forget the https and the domain name for the front end 
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://ceduconsult.herokuapp.com/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        if (err){
          console.log(err)
        } else {
          res.json({
            success: true,
            message: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
          })
          console.log('request reset mail sent')
        }
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.sendStatus(500);
  });
}

module.exports.passResetGet = (req, res) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (!user || user.strategy != "local") {
      res.json({
        success: false,
        message: 'Password reset token is invalid or has expired.'
      })
    }
    res.json({
      success: true,
      message: 'User Found',
      token: req.params.token
    })
  });
}

module.exports.passResetPost = (req, res) => {
  async.waterfall([
    function (done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function (err, user) {
        if (!user || user.strategy != "local") {
          res.json({
            success: false,
            message: 'Password reset token is invalid or has expired.'
          })
        } else {
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          user.save(function (err) {
            let token = jwt.sign(user.toJSON(), process.env.SECRETJWT, {
              expiresIn: 604800 // 1 week
            })
            let smtpTransport = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: process.env.MAILUSER,
                pass: process.env.MAILPASS
              },
              secure: true
            });
            let mailOptions = {
              to: user.email,
              from: process.env.MAILUSER,
              subject: 'Your password has been changed',
              text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log("second email sent");
              }
            });
            res.json({
              success: true,
              message: "Authentication successful",
              token: token,
              email: user.email
            });
          });
        }
      })
    },
  ], function (err) {
    res.json({
      success: false,
      message: err,
    });
  });
}




module.exports.logout = (req, res) => {
  req.logout();
  // req.session.destroy();
  res.json({
    success: true,
    message: "Bye!"
  })
}


// user profile
module.exports.user = async (req, res) => {
  try {
    let foundUser = await User.findOne({
      _id: req.decoded._id
    }).populate('classes');
    if (foundUser) {
      res.json({
        success: true,
        user: foundUser
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

module.exports.contact = (req, res) => {
  try {
    const smtpTransport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS
      },
    });
    const mailOptions = {
      to: process.env.MAILUSER,
      from: req.body.email,
      subject: 'new inquiry from ' + req.body.name,
      text: 'name: ' + req.body.name + ' \n' + 'telphone number: ' + req.body.phone + ' \n' + 'email: ' + req.body.email + ' \n' + 'Message: ' + req.body.message + ' \n' 
    };
    smtpTransport.sendMail(mailOptions, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log('mail sent')
        res.json({
          success: true,
          message: 'We Got your engquiry we will get back to you ASAP'
        })
      }
    });
  } catch (err) {
    console.log(err)
    res.json({
      success: false,
      message: 'somthing went wrong'
    });
  }
}


// search
module.exports.searchUser = async (req, res) => {
  try {
    const q = req.query.q;
    const usersFound = await User.find({username: {$regex: new RegExp(q), $options: 'i'}})
    res.json({
      success: true,
      usersFound: usersFound,
      message: 'found Users'
    })
  } catch (err){
    console.log(err)
    res.json({
      success: false,
      message: err,
    });
  }
}

// get one user
module.exports.getUser = async (req, res) => {
  try{
    const userFound = await User.findOne({
      _id: req.params.id
    }).populate('classes').populate('documents');
    res.json({
      success: true,
      userFound: userFound,
      message: 'found Users'
    })
  } catch(err){
    console.log(err)
    res.json({
      success: false,
      message: err,
    });
  }
}

// adding classroom to the user
module.exports.addClassRoom = async (req, res) => {
  try{
    const ClassRoomFound = await classRoom.findById(req.params.classId)
    const userFound = await User.findById(req.params.userId)
    userFound.classes.push(ClassRoomFound)
    await userFound.save()
    res.json({
      success: true,
      message: 'ClassRoom added to user'
    })
  } catch (err){
    console.log(err)
    res.json({
      success: false,
      message: err,
    });
  }
}

// adding classroom to the user
module.exports.removeClassRoom = async (req, res) => {
  try{
    const userFound = await User.findById(req.params.userId)
    userFound.classes.pull(req.params.classId);
    await userFound.save()
    res.json({
      success: true,
      message: 'ClassRoom removed from user'
    })
  } catch (err){
    console.log(err)
    res.json({
      success: false,
      message: err,
    });
  }
}

// adding classroom to the user
module.exports.addDocuments = async (req, res) => {
  try{
    const userFound = await User.findById(req.params.userId)
    console.log(userFound)
    req.files.docs.forEach(element => {
      userFound.documents.push({ url: element.path , filename : element.filename , fileTitle: element.originalname})
    });
    await userFound.save()
    res.json({
      success: true,
      message: 'Documents added to user'
    })
  } catch (err){
    console.log(err)
    res.json({
      success: false,
      message: err,
    });
  }
}

// adding classroom to the user
module.exports.removeDocument = async (req, res) => {
  try{
    await User.findOneAndUpdate({ _id: req.params.userId}, { $pull: { documents: { filename: req.body.fileName } } }, { new: true }, function(err){
      if (err){
        console.log(err)
      }
    }).clone()
    await cloudinary.uploader.destroy(req.body.fileName, {invalidate: true, resource_type: "raw"}, function(error,result) {
      console.log(result, error) });
    // await userFound.save()
    res.json({
      success: true,
      message: 'ClassRoom removed from user'
    })
  } catch (err){
    console.log(err)
    res.json({
      success: false,
      message: err,
    });
  }
}