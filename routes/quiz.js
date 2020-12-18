var express = require('express');
const bodyParser = require('body-parser');


var authenticate = require('../authenticate');
var User = require('../models/user');
var Course = require('../models/course');
var Quiz = require('../models/quiz');

var router = express.Router();
router.use(bodyParser.json());

router.post('/addquiz', authenticate.verifyUser, authenticate.verifyTeacher, async (req, res, next) => { //{quiz_name, total_marks, course_name, teacher_name, details}
    if (!req.body.quiz_name){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Cannot find quiz_name in req.body.`});
    }
    else if(!req.body.total_marks){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Cannot find total_marks in req.body.`});
    }
    else if(!req.body.course_name){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Cannot find course_name in req.body.`});
    }
    else{
        const course = await Course.findOne({course_name: req.body.course_name});
        if(!course){
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, err: `No course with name ${req.body.course_name} exists.`});
        }
        else{
            Quiz.create({quiz_name: req.body.quiz_name, total_marks: req.body.total_marks, details: req.body.details ? req.body.details : '', course: course._id, teacher: req.user._id})
            .then(quiz => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: true, quiz: quiz});
            });
        }
    }
})

router.get('/', authenticate.verifyUser, async (req, res, next) => {
    if (req.user.role === "teacher"){
        var quizzes = Quiz.find({teacher: req.user._id}).populate('teacher').populate('course');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, quizzes: quizzes});
    }
    else{
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Student hitting teacher's api`});
    }
});

router.get('/:course_id',authenticate.verifyUser, async (req, res, next) => {
    if (req.user.role === "student"){
        var quizzes = Quiz.find({teacher: req.user._id}).populate('teacher').populate('course');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, quizzes: quizzes});
    }
    else{
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Teacher hitting std's api.`});
    }
} )

router.put('/endquiz', authenticate.verifyUser, authenticate.verifyTeacher, async (req, res, next) => {
    if (!req.body.quiz_id){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Cannot find course_id in req.body.`});
    }
    const quiz = Quiz.findOneAndUpdate({_id: req.body.quiz_id}, { $set : {available: false} }, {$new: true}, )
    if (quiz){
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, quiz: quiz});
    }
})


module.exports = router;