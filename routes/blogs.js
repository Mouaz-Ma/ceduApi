const express = require('express');
const router = express.Router();
const blogs = require('../controllers/blogs');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdministrator } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


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

router.route('/')
    .get(catchAsync(blogs.index))

router.route('/new')
.post(uploadFile,  catchAsync(blogs.createBlog))



router.route('/:id')
    .get(catchAsync(blogs.showBlog))
    // .put(uploadFile, catchAsync(blogs.updateBlog))
    .delete(blogs.deleteBlog);

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(blogs.renderEditForm))



module.exports = router;