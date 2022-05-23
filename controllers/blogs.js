const Blog = require('../models/blog');
const { cloudinary } = require("../cloudinary");


// get all blogs in the index
module.exports.index = async (req, res) => {
    try{
        const blogs = await Blog.find({}).populate('author');
        res.json({
            success: true,
            blogs: blogs,
            message: "Loaded all blogs"
          })
    } catch(err){
        console.log(err);
    }
    
}


// creating a new blog
module.exports.createBlog = async (req, res, next) => {
    try {
        const blog = new Blog(req.body);
        blog.tags = req.body.tags.split(',');
        blog.image = {url: req.files.image[0].path, filename: req.files.image[0].filename };
        blog.author = req.body.userID;
        blog.content = req.body.description;
        blog.section = req.body.section;
        await blog.save();
        res.json({
            success: true,
            blog: blog,
            message: "Successfully made a new blog!"
          })
    } catch (err) {
        console.log(err);
    }
}

// showing one blog
module.exports.showBlog = async (req, res) => {
    try{
        const blog = await Blog.findById(req.params.id).populate('author');
        console.log(blog)
        if (blog){
            res.json({
                success: true,
                blog: blog,
                message: "Blog found"
              })
        } else {
            res.json({
                success: false,
                message: "Blog not found found"
              })  
        }
    } catch (err) {
        console.log(err)
        res.json({
            success: false,
            message: err
          })
    }
}


// updating one blog
module.exports.updateBlog = async (req, res, next) => {
    try {
        if(!req.files.image[0]){
            let blog = await Blog.findOneAndUpdate({ _id: req.params.id}, {
                $set: {
                    title: req.body.title,
                    tags: req.body.tagsInput.split(','),
                    content: req.body.content
                }
            });
            await blog.save();
            res.status(200).json({
                success: true,
                blog: blog,
                message: "Successfully updated blog!"
              })
        } else {
            let blog = await Blog.findOneAndUpdate({ _id: req.params.id}, {
                $set: {
                    title: req.body.title,
                    tags: req.body.tagsInput.split(','),
                    image: {url: req.files[0].path, filename: req.files[0].filename},
                    content: req.body.content
                }
            });
            await blog.save();
            await cloudinary.uploader.destroy(req.body.deletedImage, {invalidate: true, resource_type: "raw"}, function(error,result) {
                console.log(result, error) });
            res.status(200).json({
                success: true,
                blog: blog,
                message: "Successfully updated blog!"
              })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// deleting one blog
module.exports.deleteBlog = async (req, res, next) => {
    try {
        let deletedBlog = await Blog.findOneAndDelete({ _id: req.params.id });
        if (deletedBlog){
            await cloudinary.uploader.destroy(deletedBlog.image.filename, {invalidate: true, resource_type: "raw"},function(error,result) {
                console.log(result, error) });
            console.log(deletedBlog)
            res.status(200).json({
                success: true,
                message: "Successfully deleted blog!"
              })
            }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

