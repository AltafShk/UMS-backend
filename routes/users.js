var express = require('express');
const bodyParser = require('body-parser');
var UserRouter = express.Router();

const authenticate = require('../authenticate');
var User = require('../models/user');
var passport = require('passport');

UserRouter.use(bodyParser.json());

/* GET users listing. */

UserRouter.get('/login', authenticate.verifyUser, function(req, res, next) {
  if (!req.body.username) {
		res.send("Body doesn't contain username!");
	}
	if (!req.body.password) {
		res.send("Body doesn't contain password!");
  }
  passport.authenticate('local', (err, user, info) => {
		if (err)
			return next(err);

		if (!user) {
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
			
			var token = authenticate.getToken({_id: req.user._id});

			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json({success: true, token: token, status: 'Login Successful!'});
	});
	})(req, res, next);
});

UserRouter.post('/signup',  authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
          user.save(async (err, user) => {
            if (err) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ err: err, success: false });
              return;
            }
            passport.authenticate('local')(req, res, () => {
              var token = authenticate.getToken({ _id: user._id });
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ success: true, status: 'Registration Successful', token, user: user});
            })
          })
        }
      }
    )
})

module.exports = UserRouter;
