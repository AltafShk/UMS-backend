const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    batch: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);