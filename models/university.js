const { date } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;



const ImageSchema = new Schema({
    url: String,
    filename: String,
    public_id: String
});

const opts = { toJSON: { virtuals: true } };

const UniversitySchema = new Schema({
    title: String,
    logo: ImageSchema,
    images: [ImageSchema],
    tags: [{type: String}],
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
   
}, { timestamps: true }, opts);


UniversitySchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/University/${this._id}">${this.title}</a><strong>
    <p>${this.content.substring(0, 20)}...</p>`
});



UniversitySchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('University', UniversitySchema);