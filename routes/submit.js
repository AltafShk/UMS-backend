var express = require('express');
const bodyParser = require('body-parser');


var authenticate = require('../authenticate');
var User = require('../models/user');
var Course = require('../models/course');
var Quiz = require('../models/quiz');

var router = express.Router();
router.use(bodyParser.json());


module.exports = router;
