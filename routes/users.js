var express = require('express');
const bodyParser = require('body-parser');
var UserRouter = express.Router();

const authenticate = require('../authenticate');
var User = require('../models/user');
var passport = require('passport');

// UserRouter.use(bodyParser.json());

/* GET users listing. */

UserRouter.get('/', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
  const students = await User.find({role: 'student'});
  const teachers = await User.find({role: 'teacher'});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, students, teachers});
})

UserRouter.post('/login', function(req, res, next) { //{ username, pwd }
  console.log(req.body)
  if (!req.body.username) {
		res.send("Body doesn't contain username!");
	}
	if (!req.body.password) {
		res.send("Body doesn't contain password!");
  }
  passport.authenticate('local', (err, user, info) => {
		if (err){
      console.log('njdfjdfdfk');

			res.statusCode = 401;
			res.setHeader('Content-Type', 'application/json');
			res.json({success: false, status: 'Login Failed', err: info});
    }

		else if (!user) {
      console.log('njdfjdfdfk');

			res.statusCode = 401;
			res.setHeader('Content-Type', 'application/json');
			res.json({success: false, status: 'Login Failed', err: info});		
		}
		req.logIn(user, (err) => {
			if (err) {
				res.statusCode = 401;
				res.setHeader('Content-Type', 'application/json');
				res.json({success: false, status: 'Login Failed', err: 'Could not log in user!'});
			}
			else{
        var token = authenticate.getToken({_id: req.user._id});

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, token: token, user: user, status: 'Login Successful!'});
      }
			
	});
	})(req, res, next);
});

UserRouter.post('/signup', (req, res, next) => {
    User.register(new User({
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      role: req.body.role,
      batch: req.body.batch
    }), req.body.password,
      (err, user) => {
        if (err) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err: err, success: false });
        }
        else {
          user.save((err, user) => {
            if (err) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ err: err, success: false });
              return;
            }
            passport.authenticate('local')(req, res, () => {
              // var token = authenticate.getToken({ _id: user._id });
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ success: true, status: 'Registration Successful'});
            })
          })
        }
      }
    )
})

module.exports = UserRouter;