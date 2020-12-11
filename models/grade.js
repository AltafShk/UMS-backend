const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var GradeSchema = new Schema({
    grade: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

module.exports = mongoose.model('Quiz', GradeSchema);