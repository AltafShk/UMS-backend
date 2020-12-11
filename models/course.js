const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CourseSchema = new Schema({
    course_name: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    students: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }]
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema);