const University = require('../models/university');
const { cloudinary } = require("../cloudinary");


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
        console.log(req.files.logo)
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
        const university = await University.findById(req.params.id).populate('author');
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
        if(!req.files.photo && !req.files.audio){
            let university = await University.findOneAndUpdate({ _id: req.params.id}, {
                $set: {
                    title: req.body.title,
                    tags: req.body.tagsInput.split(','),
                    content: req.body.content,
                    category: req.body.category
                }
            });
            await university.save();
            res.status(200).json({
                success: true,
                university: university,
                message: "Successfully updated university!"
              })
        } else if (req.files.photo && !req.files.audio) {
            let university = await University.findOneAndUpdate({ _id: req.params.id}, {
                $set: {
                    title: req.body.title,
                    tags: req.body.tagsInput.split(','),
                    image: {url: req.files.photo[0].path, filename: req.files.photo[0].filename },
                    content: req.body.content,
                    category: req.body.category
                }
            });
            await university.save();
            if(req.body.deletedImage){
                await cloudinary.uploader.destroy(req.body.deletedImage, {invalidate: true, resource_type: "raw"}, function(error,result) {console.log(console.log('image' + result, error))});
            }
            res.status(200).json({
                success: true,
                university: university,
                message: "Successfully updated university!"
              })
        } else if (!req.files.photo && req.files.audio){
            console.log(req.files.audio);
            let university = await University.findOneAndUpdate({ _id: req.params.id}, {
                $set: {
                    title: req.body.title,
                    tags: req.body.tagsInput.split(','),
                    audio: {url: req.files.audio[0].path, filename: req.files.audio[0].filename },
                    content: req.body.content,
                    category: req.body.category
                }
            });
            await university.save();
            if(req.body.deletedAudio){
                await cloudinary.uploader.destroy(req.body.deletedAudio, {invalidate: true, resource_type: "raw"}, function(error,result) {console.log(console.log('audio' +result, error) )});
            }
            res.status(200).json({
                success: true,
                university: university,
                message: "Successfully updated university!"
              })
        } else if ( req.files.photo && req.files.audio){
            let university = await University.findOneAndUpdate({ _id: req.params.id}, {
                $set: {
                    title: req.body.title,
                    tags: req.body.tagsInput.split(','),
                    image: {url: req.files.photo[0].path, filename: req.files.photo[0].filename },
                    audio: {url: req.files.audio[0].path, filename: req.files.audio[0].filename },
                    content: req.body.content,
                    category: req.body.category
                }
            });
            await university.save();
            if(req.body.deletedAudio && req.body.deletedImage){
                await cloudinary.uploader.destroy(req.body.deletedImage, {invalidate: true, resource_type: "raw"}, function(error,result) {console.log('image' + result, error) });
                await cloudinary.uploader.destroy(req.body.deletedAudio, {invalidate: true, resource_type: "raw"}, function(error,result) {console.log('audio' +  result, error) });
            } else if(req.body.deletedAudio && !req.body.deletedImage){
                await cloudinary.uploader.destroy(req.body.deletedAudio, {invalidate: true, resource_type: "raw"}, function(error,result) {console.log('audio' +  result, error) });
            } else if(!req.body.deletedAudio && req.body.deletedImage){
                await cloudinary.uploader.destroy(req.body.deletedImage, {invalidate: true, resource_type: "raw"}, function(error,result) {console.log('image' + result, error) });
            }
            res.status(200).json({
                success: true,
                university: university,
                message: "Successfully updated university!"
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

// deleting single university
module.exports.deleteSingle = async (req, res) => {
    try {
        let deletedUniversity = await University.findOneAndDelete(req.params.id);
        if (deletedUniversity.image.filename != 'Default university Image'){
            await cloudinary.uploader.destroy(deletedUniversity.image.filename,
            {invalidate: true, resource_type: "raw"},
            function(error,result) {console.log(result, error) });
        }
        if (deletedUniversity.audio != null){
            await cloudinary.uploader.destroy(deletedUniversity.audio.filename, 
            {invalidate: true, resource_type: "raw"}, 
            function(error,result) {console.log(result, error) });
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