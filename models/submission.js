const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var QuizSchema = new Schema({
    obtained_marks: {
        type: Number,
    },
    submitted_file: {
        type: String,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);