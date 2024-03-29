const { date } = require('joi');
const mongoose = require('mongoose');
// const Review = require('./review')
const Schema = mongoose.Schema;



const ImageSchema = new Schema({
    url: String,
    filename: String,
    public_id: String
});

const opts = { toJSON: { virtuals: true } };

const ClassSchema = new Schema({
    title: String,
    image: ImageSchema,
    tags: [{type: String}],
    classDate: Date,
    classTime: String,
    instructor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    type: String,
    zoomLink: String,
    description: String,
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
   
}, { timestamps: true }, opts);


ClassSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/class/${this._id}">${this.title}</a><strong>
    <p>${this.content.substring(0, 20)}...</p>`
});



// ClassSchema.post('findByIdAndDelete', async function (doc) {
//     if (doc) {
//         await Review.deleteMany({
//             _id: {
//                 $in: doc.reviews
//             }
//         })
//     }
// })

module.exports = mongoose.model('Class', ClassSchema);