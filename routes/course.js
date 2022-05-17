const express = require('express');
const router = express.Router();
const course = require('../controllers/course');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(course.index))

async function uploadFile(req, res, next) {
    const upload = await multer({ storage }).fields([{name: 'image', maxCount: 1}])

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log("first error" + JSON.stringify(err))
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log("second error" + JSON.stringify(err))
        }
        // Everything went fine. 
        next()
    })
}

router.route('/new')
.post(uploadFile,  catchAsync(course.createCourse))



router.route('/:id')
    .get(catchAsync(course.getSingle))
//     .put(uploadFile, course.updateSingle)
//     .delete(course.deleteSingle);




module.exports = router;