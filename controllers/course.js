const Course = require('../models/course');
const University = require('../models/university');
const { cloudinary } = require("../cloudinary");


// get all courses 
module.exports.index = async (req, res) => {
    try{
        const courses = await Course.find().populate('university')
        res.json({
            success: true,
            courses: courses,
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

// creating a new course
module.exports.createCourse = async (req, res, next) => {
    try{
            const university = await University.findById(req.body.uniSelected);
            console.log(req.files)
            const course = new Course();
            course.title = req.body.title;
            course.image = {url: req.files.image[0].path, filename: req.files.image[0].filename };
            course.tags = req.body.tags.split(',');
            course.author = req.body.userID;
            course.description = req.body.description;
            course.starting = req.body.startingDate;
            course.courseType = req.body.courseType;
            course.university = req.body.uniSelected;
            university.courses.push(course);
            await university.save();
            await course.save();
            res.json({
                success: true,
                course: course,
                message: "Successfully made a new course!"
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
        const course = await Course.findById(req.params.id).populate(['author', 'university']);
        res.json({
            success: true,
            course: course,
            message: "course retrieved succesfully!"
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
// module.exports.updateSingle = async (req, res) => {
//     try {

//         console.log(req.body)
//         let university = await University.findById(req.params.id);
//         university.title = req.body.title;
//         university.tags = req.body.tags.split(',');
//         university.description = req.body.description;
//         console.log(req.body.deletedLogo)
//         if(req.files.logo){
//             await cloudinary.uploader.destroy(req.body.deletedLogo,
//                 {invalidate: true, resource_type: "raw"},
//                 function(error,result) {console.log(result, error) });
//                 university.logo.url = req.files.logo[0].path
//                 university.logo.filename =  req.files.logo[0].filename
//         }
//         if(req.files.images){
//             for (const image in req.body.deletedimages){
//                 await cloudinary.uploader.destroy(req.body.deletedimages[image], 
//                     {invalidate: true, resource_type: "raw"}, 
//                     function(error,result) {console.log(result, error) }); 
//             }
//             university.images = [];
//             req.files.images.forEach(image => {
//                 university.images.push({url: image.path, filename: image.filename})
//             });
//         }

//         await university.save();
//         res.status(200).json({
//             success: true,
//             university: university,
//             message: "Successfully updated University!"
//           })

//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             success: false,
//             message: err.message
//           })
//     }
// }

// deleting single university
// module.exports.deleteSingle = async (req, res) => {
//     try {
//         let deletedUniversity = await University.findOneAndDelete(req.params.id);
//             await cloudinary.uploader.destroy(deletedUniversity.logo.filename,
//             {invalidate: true, resource_type: "raw"},
//             function(error,result) {console.log(result, error) });
//         if (deletedUniversity.images.length){
//             for (const image in deletedUniversity.images){
//                 // console.log(`${deletedUniversity.images[image].filename}`);
//                 await cloudinary.uploader.destroy(deletedUniversity.images[image].filename, 
//                     {invalidate: true, resource_type: "raw"}, 
//                     function(error,result) {console.log(result, error) }); 
//             }
//         }
//             res.status(200).json({
//                 success: true,
//                 message: "Successfully deleted University!"
//               })
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             success: false,
//             message: err.message
//           })
//     }
// }