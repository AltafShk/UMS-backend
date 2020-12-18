const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var QuizSchema = new Schema({
    quiz_name: {
        type: String,
        required: true
    },
    total_marks: {
        type: Number,
        required: true
    },
    details: {
        type: String,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    available: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);