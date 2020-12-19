var express = require('express');
const bodyParser = require('body-parser');

var authenticate = require('../authenticate');
var Course = require('../models/course');
var Submission = require('../models/submission');
const multer = require('multer');
var crypto = require("crypto");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, 'public/submissions');
    },

    filename: (req, file, cb) => {
        console.log(file);
        const code = crypto.randomBytes(4).toString('hex');
        cb(null, `submission_${code}.${file.originalname.split('.')[1]}`);
    }
});

const imageFileFilter = (req, file, cb) => {
    console.log(file)
    if(!file.originalname.match(/\.pdf$/)) {
        return cb(new Error('You can upload only pdf files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

var router = express.Router();
router.use(bodyParser.json());

router.route('/:course_id/:quiz_id')
.post(authenticate.verifyUser, upload.single('pdfFile'), async (req, res) => {
    console.log("abcd");
    console.log(req.file);
    var a = req.file.path.split('public\\')[1];
    console.log(a);
    Submission.create({student: req.user._id, submitted_file: a, course: req.params.course_id, quiz: req.params.quiz_id })
    .then(data => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, submission: data});
    })
});

router.route('/setgrade')
.put(authenticate.verifyUser, async (req, res, next) => {
    if (req.user.role === "teacher"){
        if (!req.body.obtained_marks){
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, err: `Cannot find obtained_marks in req.body.`});
        }
        else if (!req.body.student_id){
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, err: `Cannot find studente_id in req.body.`});
        }
        else if (!req.body.quiz_id){
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, err: `Cannot find quiz_id in req.body.`});
        }
        else if (!req.body.course_id){
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, err: `Cannot find course_id in req.body.`});
        }
        else{
            var s = await Submission.findOneAndUpdate({student: req.body.student_id, quiz: req.body.quiz_id}, {$set: {obtained_marks: req.body.obtained_marks}}, {new: true});
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, graded: s});
        }
    }
    else{
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Student hitting teacher's api`});
    }
})

router.route('/')
.get(authenticate.verifyUser, async (req, res, next) => {
    console.log(req.user)
    if (req.user.role === "teacher"){
        var s = [];
        const courses = await Course.find({teacher: req.user._id}).populate('');
        courses.forEach(async course => {
            var a = await Submission.find({course: course._id});
            s.push(a);
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, submission: s});
    }
    else if (req.user.role === "student"){
        var subm = await Submission.find({student: req.user._id}).populate('quiz').populate("quiz");
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, submission: subm});
    }
});

router.route('/studentgrades/:course_id')
.get(authenticate.verifyUser, async (req, res, next) => {
    var subm = await Submission.find({student: req.user._id, course: req.params.course_id}).populate('quiz');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, submission: subm});
});

router.route('/quiz/:quiz_id')
.get(authenticate.verifyUser, async (req, res, next) => {
    console.log(req.user)
    if (req.user.role === "teacher"){
        var s = [];
        // const subm = await Submission.find({teacher: req.user._id, quiz: req.params.quiz_id}).populate('student').populate('quiz').populate('course');
        const subm = await Submission.find({quiz: req.params.quiz_id}).populate('student').populate('quiz').populate('course');
        var course_of_quiz = {students: []};
        console.log("SUBM", subm)
        if (subm.length > 0){
            course_of_quiz = await Course.findById(subm[0].quiz.course).populate('students');
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, submission: subm, students: course_of_quiz.students});
    }
});


router.route('/course/:course_id')
.get(authenticate.verifyUser, async (req, res, next) => {
    console.log(req.user)
    if (req.user.role === "teacher"){
        const subm = await Submission.find({teacher: req.user._id, course: req.params.course_id}).populate('student').populate('quiz').populate('course');
        const course_of_quiz = await Course.findById(subm.course._id).populate('students');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, submission: subm, students: course_of_quiz.students});
    }
});

module.exports = router;
