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
            console.log(university)
            const course = new Course();
            course.title = req.body.title;
            course.image = {url: req.files.image[0].path, filename: req.files.image[0].filename };
            course.tags = req.body.tags.split(',');
            course.author = req.body.userID;
            course.description = req.body.description;
            course.starting = req.body.startingDate;
            course.courseType = req.body.courseType;
            course.university = req.body.uniSelected;
            course.yearsOfStuday = req.body.yearsOfStuday;
            course.languageOfInstruction = req.body.languageOfInstruction;
            course.ects = req.body.ects;
            course.availability = req.body.availability;
            course.degreeAwarded = req.body.degreeAwarded;
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

// updating single course
module.exports.updateSingle = async (req, res) => {
    try {
        console.log(req.body)
        const university = await University.findById(req.body.uniSelected);
        const oldUniversity = await University.findByIdAndUpdate(req.body.oldUniversity, { $pull: { courses: req.params.id } });
        let course = await Course.findById(req.params.id);
        course.title = req.body.title;
        course.tags = req.body.tags.split(',');
        course.description = req.body.description;
        course.university = req.body.uniSelected;
        course.starting = req.body.startingDate;
        course.courseType = req.body.courseType;
        course.yearsOfStuday = req.body.yearsOfStuday;
        course.languageOfInstruction = req.body.languageOfInstruction;
        course.ects = req.body.ects;
        course.availability = req.body.availability;
        course.degreeAwarded = req.body.degreeAwarded;
        if(req.files.image){
                await cloudinary.uploader.destroy(req.body.deletetedImage, 
                    {invalidate: true, resource_type: "raw"}, 
                    function(error,result) {console.log(result, error) }); 
                    course.image = ({url: req.files.image[0].path, filename: req.files.image[0].filename})
            }
        university.courses.push(course);
        console.log(oldUniversity)
        await oldUniversity.save()
        await university.save();
        await course.save();
        res.status(200).json({
            success: true,
            course: course,
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

// deleting single course
module.exports.deleteSingle = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id).populate('university');
        let oldUniversity = await University.findByIdAndUpdate(course.university.id, { $pull: { courses: req.params.id } });
        await oldUniversity.save();
        let deletedCourse = await Course.findByIdAndDelete(req.params.id);
            await cloudinary.uploader.destroy(deletedCourse.image.filename,
            {invalidate: true, resource_type: "raw"},
            function(error,result) {console.log(result, error) });
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