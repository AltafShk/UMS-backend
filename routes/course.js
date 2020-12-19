var express = require('express');
const bodyParser = require('body-parser');


var authenticate = require('../authenticate');
var User = require('../models/user');
var Course = require('../models/course');

var courseRouter = express.Router();
courseRouter.use(bodyParser.json());

courseRouter.get('/', authenticate.verifyUser, async (req, res, next) => { // { course_name: 'xyz' }
    if (req.user.role === "teacher"){
        const courses = await Course.find({teacher: req.user._id}).populate('students').populate('teacher');
        var x = [];
        courses.forEach(c => {
            if (req.user._id.equals(c.teacher._id)){
                x.push(c);
            }
        })
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, courses: x});
    }
    else if (req.user.role === "student"){
        const courses = await Course.find({}).populate('students').populate('teacher');
        var r = [];
        courses.forEach(c => {
            c.students.forEach(s => {
                if (req.user._id.equals(s._id)){
                    r.push(c);
                }
            })
        })
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, courses: r});
    }
})

courseRouter.post('/addcourse', (req, res, user) => { // { course_name: 'xyz', teacher_name: 'name' }
    if (!req.body.teacher_name){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Cannot find property with name teacher_name in req.body object.`});
    }
    else if (!req.body.course_name){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Cannot find property with name course_name in req.body object.`});
    }
    else{
        User.findOne({username: req.body.teacher_name, role: 'teacher'})
        .then(async user => {
            if (user){
                const crs = await Course.findOne({course_name: req.body.course_name});
                if (crs){
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: false, err: `Course with name ${req.body.course_name} exists.`});
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
                res.json({success: false, err: `No teacher with username ${req.body.teacher_name} exists.`});
            }
        })
    }
});

courseRouter.put('/addstudent', async (req, res, next) => { // { course_name: 'xyz', student_name: 'xyz' }
    if (!req.body.student_name){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Cannot find student_name in req.body.`});
    }
    else if (!req.body.course_name){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Cannot find course_name in req.body.`});
    }
    else{
        const course = await  Course.findOne({course_name: req.body.course_name});
        const user = await User.findOne({username: req.body.student_name, role: 'student'});
        if (!user){
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, err: `No student with username ${req.body.student_name} exists.`});
        }
        else if (!course){
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, err: `No course with name ${req.body.course_name} exists.`});
        }
        else{
            if (course.students.includes(user._id)){
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: false, err: `Student with username ${req.body.student_name} already in this course.`});
            }
            else{
                course.students = course.students.concat([user._id]);
                course.save((err, crs) => {
                    Course.findById(course._id)
                    .populate('students', 'username firstname lastname batch')
                    .populate('teacher', 'username firstname lastname')
                    .then(cda => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({course: cda, success: true});
                    })
                });
            }
        }
    }
});

module.exports = courseRouter;