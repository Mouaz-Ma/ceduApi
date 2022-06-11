const University = require('../models/university');
const { cloudinary } = require("../cloudinary");
const Course = require('../models/course');


// get all universities 
module.exports.index = async (req, res) => {
    try{
        const universities = await University.find()
        res.json({
            success: true,
            universities: universities,
            message: "university retrieved succesfully!"
          })
    } catch (err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// creating a new university
module.exports.createUniversity = async (req, res, next) => {
    try{
            const university = new University(req.body);
            if(req.files.images){
                req.files.images.forEach(image => {
                    university.images.push({url: image.path, filename: image.filename })
                });
            }
            university.logo = {url: req.files.logo[0].path, filename: req.files.logo[0].filename };
            university.tags = req.body.tags.split(',');
            university.author = req.body.userID;
            await university.save();
            res.json({
                success: true,
                university: university,
                message: "Successfully made a new university!"
              })
    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: err
          })
    }
}


// showing single
module.exports.getSingle = async (req, res) => {
    try{
        const university = await University.findById(req.params.id).populate(['author', 'courses']);
        res.json({
            success: true,
            university: university,
            message: "university retrieved succesfully!"
          })
    } catch (err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// updating single university
module.exports.updateSingle = async (req, res) => {
    try {
        let university = await University.findById(req.params.id);
        university.title = req.body.title;
        university.tags = req.body.tags.split(',');
        university.description = req.body.description;
        console.log(req.body.deletedLogo)
        if(req.files.logo){
            await cloudinary.uploader.destroy(req.body.deletedLogo,
                {invalidate: true, resource_type: "raw"},
                function(error,result) {console.log(result, error) });
                university.logo.url = req.files.logo[0].path
                university.logo.filename =  req.files.logo[0].filename
        }
        if(req.files.images){
            for (const image in req.body.deletedimages){
                await cloudinary.uploader.destroy(req.body.deletedimages[image], 
                    {invalidate: true, resource_type: "raw"}, 
                    function(error,result) {console.log(result, error) }); 
            }
            university.images = [];
            req.files.images.forEach(image => {
                university.images.push({url: image.path, filename: image.filename})
            });
        }

        await university.save();
        res.status(200).json({
            success: true,
            university: university,
            message: "Successfully updated University!"
          })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// deleting single university
module.exports.deleteSingle = async (req, res) => {
    let deletedUniversity = await University.findById(req.params.id);
    console.log(deletedUniversity)
    try {
        let deletedUniversity = await University.findByIdAndDelete(req.params.id);
        if(deletedUniversity.courses.length != 0){
        for (const subCourse of deletedUniversity.courses) {
            console.log(subCourse)
            // await Course.findByIdAndDelete(subCourse._id)
            // await cloudinary.uploader.destroy(subCourse.image.filename,
            //     {invalidate: true, resource_type: "raw"},
            //     function(error,result) {console.log(result, error) });
        }
    }
            await cloudinary.uploader.destroy(deletedUniversity.logo.filename,
            {invalidate: true, resource_type: "raw"},
            function(error,result) {console.log(result, error) });
        if (deletedUniversity.images.length){
            for (const image in deletedUniversity.images){
                // console.log(`${deletedUniversity.images[image].filename}`);
                await cloudinary.uploader.destroy(deletedUniversity.images[image].filename, 
                    {invalidate: true, resource_type: "raw"}, 
                    function(error,result) {console.log(result, error) }); 
            }
        }
            res.status(200).json({
                success: true,
                message: "Successfully deleted University!"
              })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}