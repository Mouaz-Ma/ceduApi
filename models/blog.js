const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;



const ImageSchema = new Schema({
    url: String,
    filename: String,
    public_id: String
});

const opts = { toJSON: { virtuals: true } };

const BlogSchema = new Schema({
    title: String,
    image: ImageSchema,
    section: String,
    tags: [{type: String}],
    content: String,
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


BlogSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/blogs/${this._id}">${this.title}</a><strong>
    <p>${this.content.substring(0, 20)}...</p>`
});



BlogSchema.post('findByIdAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Blog', BlogSchema);