const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const passportLocalMongoose = require('passport-local-mongoose');

const ImageSchema = new Schema({
    url: String,
    filename: String
});
const docSchema = new Schema({
    url: String,
    filename: String,
    fileTitle: String
});

const bcrypt = require('bcrypt');

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// const opts = { toJSON: { virtuals: true } };

const UserSchema = new Schema({
    userType: {
        type: String
    },
    avatar:ImageSchema,
    documents:[docSchema],
    strategy: {
        type: String
    },
    uniqueString: {
        type: String
    },
    telephone: {
        type: String
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    classes: [{
        type: Schema.Types.ObjectId,
        ref: 'Class'
    }],
    studentStatus: {
        type: String
    },
    userType: {
        type: String,
        default: 'Normal_User'
    },
    isVerified: {type: Boolean, default: false},
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.pre('save', function (next) {
    let user = this;
    if ((this.isModified('password') || this.isNew) && this.strategy === "local") {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err)
            }
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    return next(err);
                } else {
                    user.password = hash;
                    next();
                }
            })
        })
    } else {
        return next();
    }
})

UserSchema.methods.comparePassword = function(password, next){
    let user = this;
    return bcrypt.compareSync(password, user.password);
}

module.exports = mongoose.model('User', UserSchema);