const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const multer = require('multer');
const { storage } = require('../cloudinary');

const users = require('../controllers/users');
const {
    verifyToken
} = require('../middleware');

async function uploadFile(req, res, next) {
    const upload = await multer({ storage }).fields([{name: 'avatar', maxCount: 1}, {name: 'docs', maxCount: 10}])

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log(" Multer error" + JSON.stringify(err))
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log("unknown error" + JSON.stringify(err))
        }
        // Everything went fine. 
        next()
    })
}


// get one user 
router.route('/userInfo/:id')
    .get(users.getUser)

// register with credentials
router.route('/register')
    .post(catchAsync(users.register));

// register with social media
router.route('/registerSocial')
    .post(catchAsync(users.registerSocial));


router.route('/login')
    .post(users.login)

// profile
router.route('/user')
    .get(verifyToken, users.user)

// EmailVerifying
router.route('/verify/:uniqueString')
    .get(users.emailVerify)

// get verified
router.route('/varifyById/:id')
    .get(users.getVerified)

// password reset
router.route('/requestReset').post(users.requestReset)

router.route('/passReset/:token')
    .get(users.passResetGet)
    .post(users.passResetPost)

// search Users
router.route('/search').get(users.searchUser)

// adding classroom to the user
router.route('/addClassRoom/:classId/:userId')
    .post(users.addClassRoom)

// removing classroom from a user
router.route('/removeClassRoom/:classId/:userId')
    .post(users.removeClassRoom)

// updating users and documents
router.route('/updateUser/:id')
    .put(uploadFile, users.updateUser)
// handeling avatar change
router.route('/updateUserAvatar/:id')
    .put(uploadFile, users.updateUserAvatar)

// adding documents to the user
router.route('/addDocuments/:userId')
.post(uploadFile, users.addDocuments)

// removing documents from a user
router.route('/removeDocument/:userId')
.post(users.removeDocument)  


router.post('/logout', users.logout)

// contact form
router.post('/contact', users.contact)

module.exports = router;
