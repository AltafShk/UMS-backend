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

router.route('/')
.post(authenticate.verifyUser, authenticate.verifyStudent, upload.single('pdfFile'), async (req, res) => {
    if (req.body.quiz_id){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Cannot find quiz_id in req.body.`});
    }
    else if (req.body.course_id){
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: `Cannot find course_id in req.body.`});
    }
    console.log("abcd");
    console.log(req.file);
    var a = req.file.path.split('public/')[1];
    Submission.create({student: req.user._id, submitted_file: a, course: req.body.course_id })
    .then(data => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, submission: data});
    })
});

router.route('/')
.put('/setgrade', authenticate.verifyUser, async (req, res, next) => {
    if (req.user.role === "teacher"){
        if (!req.body.obtained_marks){
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, err: `Cannot find obtained_marks in req.body.`});
        }
        else if (!req.body.studet_id){
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
            var s = await Submission.findOneAndUpdate({student: req.body.student_id, quiz: req.body.quiz_id, obtained_marks: req.body.obtained_marks});
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
        var subm = await Submission.find({student: req.user._id}).populate('quiz');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, submission: subm});
    }
});

module.exports = router;
