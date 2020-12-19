var express = require('express');
const bodyParser = require('body-parser');
var router = express.Router();

const authenticate = require('../authenticate');
var User = require('../models/user');
var passport = require('passport');
const Course = require('../models/course');

router.use(bodyParser.json());

router.get('/init', async function(req, res, next) {
  const users = [
    {username: "altaf0", firstname: "altaf", lastname: "sheikh", role: "student", batch: "2022", password: "abcd"},
    {username: "arham0", firstname: "arham", lastname: "ahmed", role: "student", batch: "2022", password: "abcd"},
    {username: "alam0", firstname: "ammarrr", lastname: "alam", role: "student", batch: "2022", password: "abcd"},
    {username: "jazib0", firstname: "jazib", lastname: "bhatti", role: "student", batch: "2022", password: "abcd"},
    {username: "faizan0", firstname: "faizan", lastname: "kazi", role: "student", batch: "2022", password: "abcd"},
    {username: "ammar0", firstname: "ammar", lastname: "khalid", role: "student", batch: "2022", password: "abcd"},
    {username: "niha0", firstname: "nehan", lastname: "jeoffery", role: "teacher", password: "abcd"},
    {username: "sarfaraz0", firstname: "sarfaraz", lastname: "hussain", role: "teacher", password: "abcd"},
    {username: "shah0", firstname: "shah", lastname: "jamal", role: "teacher", password: "abcd"},
  ];
  var result = [];
  const allUsers = await User.find({});
  console.log(allUsers);
  if (allUsers.length > 0){
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: false});
  }
  else{
    var allTasks = [];
    users.forEach(async u => {
      console.log("uu", u);
      User.register(new User({
        username: u.username,
        firstname: u.firstname,
        lastname: u.lastname,
        role: u.role,
        batch: u.role === "teacher" ? "" : u.batch
      }), u.password,
        async (err, user) => {
          if (err) {
            console.log(err, "abcd")
          }
          else {
            await user.save((err, usr) => {
              if (err) {
                console.log(err, "abcddd");
              }
              passport.authenticate('local')(req, res, () => {
                allTasks.push(usr);
              })
            })
          }
        }
      )
    })
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    console.log("allTasks", allTasks);
    res.json({success: true, status: "Created!"});
  }
});

router.post('/addcourses', async function(req, res, next) {

  const courses = [
    {"course_name": "webdev", "teacher_name": "sarfaraz0", "students": ["altaf0", "arham0"]},
    {"course_name": "linear", "teacher_name": "niha0", "students": ["faizan0", "jazib0"]},
    {"course_name": "calc", "teacher_name": "shah0", "students": ["alam0", "ammar0"]}
  ];
  const coursess = await Course.count({});
  courses.forEach(async c => {
    console.log("here");
    var teacher = await User.findOne({username: c.teacher_name, role: 'teacher'});
        if (teacher){
            const crs = await Course.findOne({course_name: c.course_name});
            if (crs){
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: false, err: `Course with name ${c.course_name} exists.`});
            }
            else{
                var crse = await Course.create({course_name: c.course_name, teacher: teacher._id});
            }
        }
  })
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: "Created!"});
});

router.post('/addstudents', async function(req, res, next) {

  const courses = [
    {"course_name": "webdev", "teacher_name": "sarfaraz0", "students": ["altaf0", "arham0"]},
    {"course_name": "linear", "teacher_name": "niha0", "students": ["faizan0", "jazib0"]},
    {"course_name": "calc", "teacher_name": "shah0", "students": ["alam0", "ammar0"]}
  ];
  courses.forEach(async course => {
    console.log(course.course_name);
    const course_obj = await Course.findOne({"course_name": course.course_name});
    console.log(course_obj);
    course.students.forEach(async student => {
      console.log(student);
      var abcd = await User.findOne({"username": student});
      console.log(abcd);
      course_obj.students = course_obj.students.concat([abcd._id]);
      console.log(student, course_obj);
    })
    console.log(course_obj);
    course_obj.save(err, crs => {
      console.log(crs, err);
    })
  })
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: "Created!"});
});





module.exports = router;
