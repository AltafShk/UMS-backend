var express = require('express');
const bodyParser = require('body-parser');


var authenticate = require('../authenticate');
var User = require('../models/user');
var Course = require('../models/course');

const cors = require('./cors');

var courseRouter = express.Router();
courseRouter.use(bodyParser.json());

courseRouter.get('/course', authenticate.verifyUser, (req, res, next) => {
    const course = await Course.findOne({course_name: req.body.course_name}).populate('students').populate('teacher');
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: false, err: `No teacher with username ${req.body.username} exists.`});
})

courseRouter.post('/addcourse', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, user) => {
    User.findById({username: req.body.username, role: 'teacher'})
    .then(async user => {
        if (user){
            const crs = await Course.findOne({course_name: req.body.course_name});
            if (crs){
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: false, err: `No teacher with username ${req.body.username} exists.`});
            }
            else{
                Course.create({course_name: req.body.course_name, teacher: user._id})
                .then(course => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, course});
                })
            }
        }
        else{
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, err: `No teacher with username ${req.body.username} exists.`});
        }
    })
});

courseRouter.put('/addstudent', authenticate.verifyUser, async (req, res, next) => {
    const course = await  Course.findOne({course_name: req.body.course_name})
    const user = await User.findOne({username: req.body.student_name, role: 'student'});
    if (!user){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `No student with username ${req.body.username} exists.`});
    }
    else if (!course){

        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `No student with username ${req.body.username} exists.`});
    }
    else{
        course.student = course.student.concat([user._id]);
        course.save((err, crs) => {
            Course.findById(cd._id)
            .populate('students', 'username firstname lastname')
            .populate('teacher')
            .then(cda => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({course: crs, success: true});
            })

        });
    }
});

module.exports = courseRouter;