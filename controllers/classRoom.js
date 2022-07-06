const ClassRoom = require('../models/classRoom');
const { cloudinary } = require("../cloudinary");


// get all classRooms in the index
module.exports.index = async (req, res) => {
    try{
        const classRooms = await ClassRoom.find({});
        res.json({
            success: true,
            classRooms: classRooms,
            message: "Loaded all classRooms"
          })
    } catch(err){
        console.log(err);
    }
    
}


// creating a new classRoom
module.exports.createClassRoom = async (req, res, next) => {
    try {
        const classRoom = new ClassRoom(req.body);
        classRoom.tags = req.body.tags.split(',');
        classRoom.image = {url: req.files.image[0].path, filename: req.files.image[0].filename };
        classRoom.author = req.body.userID;
        classRoom.content = req.body.description;
        classRoom.section = req.body.section;
        await classRoom.save();
        res.json({
            success: true,
            classRoom: classRoom,
            message: "Successfully made a new blog!"
          })
    } catch (err) {
        console.log(err);
    }
}

// showing one classRoom
module.exports.showClassRoom = async (req, res) => {
    try{
        const classRoom = await ClassRoom.findById(req.params.id).populate('author');
        console.log(classRoom)
        if (classRoom){
            res.json({
                success: true,
                classRoom: classRoom,
                message: "ClassRoom found"
              })
        } else {
            res.json({
                success: false,
                message: "ClassRoom not found found"
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


// updating one classRoom
module.exports.updateClassRoom = async (req, res, next) => {
    try {
        if(!req.files.image){
            let classRoom = await ClassRoom.findByIdAndUpdate({ _id: req.params.id});
            classRoom.title = req.body.title;
            classRoom.tags = req.body.tags.split(',');
            classRoom.content = req.body.description;
            classRoom.section = req.body.section;
            await classRoom.save();
            res.status(200).json({
                success: true,
                classRoom: classRoom,
                message: "Successfully updated classRoom!"
              })
        } else {
            let classRoom = await ClassRoom.findByIdAndUpdate({ _id: req.params.id});
                classRoom.title= req.body.title,
                classRoom.tags= req.body.tags.split(','),
                classRoom.image= {url: req.files.image[0].path, filename: req.files.image[0].filename},
                classRoom.content= req.body.description
                classRoom.section = req.body.section;
            
            await classRoom.save();
            await cloudinary.uploader.destroy(req.body.deletedImage, {invalidate: true, resource_type: "raw"}, function(error,result) {
                console.log(result, error) });
            res.status(200).json({
                success: true,
                classRoom: classRoom,
                message: "Successfully updated classRoom!"
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

// deleting one classRoom
module.exports.deleteClassRoom = async (req, res, next) => {
    try {
        let deletedclassRoom = await classRoom.findOneAndDelete({ _id: req.params.id });
        if (deletedclassRoom){
            await cloudinary.uploader.destroy(deletedclassRoom.image.filename, {invalidate: true, resource_type: "raw"},function(error,result) {
                console.log(result, error) });
            res.status(200).json({
                success: true,
                message: "Successfully deleted class room!"
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


// search
module.exports.searchClass = async (req, res) => {
    try {
      const q = req.query.q;
      const classesFound = await ClassRoom.find({title: {$regex: new RegExp(q), $options: 'i'}})
      res.json({
        success: true,
        classesFound: classesFound,
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