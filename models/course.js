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

const CourseSchema = new Schema({
    title: String,
    image: ImageSchema,
    tags: [{type: String}],
    starting: Date,
    courseType: String,
    description: String,
    yearsOfStuday: String,
    languageOfInstruction: String,
    ects: String,
    availability: String,
    degreeAwarded: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    university: {
        type: Schema.Types.ObjectId,
        ref: 'University'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
   
}, { timestamps: true }, opts);


CourseSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/course/${this._id}">${this.title}</a><strong>
    <p>${this.content.substring(0, 20)}...</p>`
});



CourseSchema.post('findByIdAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Course', CourseSchema);