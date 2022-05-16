const express = require('express');
const router = express.Router();
const university = require('../controllers/university');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(university.index))

async function uploadFile(req, res, next) {
    const upload = await multer({ storage }).fields([{name: 'logo', maxCount: 1}, {name: 'images', maxCount: 5}])

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
.post(uploadFile,  catchAsync(university.createUniversity))



router.route('/:id')
    .get(catchAsync(university.getSingle))
    .put(uploadFile, university.updateSingle)
    .delete(university.deleteSingle);




module.exports = router;