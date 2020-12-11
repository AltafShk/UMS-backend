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
    obtained_marks: {
        type: Number,
        required: true
    },
    details: {
        type: Number,
    },
    submitted_file: {
        type: String,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);