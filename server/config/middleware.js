var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var auth = require('../auth/authPassport');
var twitter = require('../external/twitter.js');
var User = require('../users/userModel.js');
var request = require('request');

/**
 * Core Middleware
 *
 * Sets up top-level routes, authentication, and session initialization
 *
 * @param {Application} app - Express Application
 * @param {Express} express
 * @api public
 */
module.exports = function(app, express){
  app.use(cookieParser('add a secret here'));
  app.use(session({ secret: 'xyz-qwrty', resave: false, saveUninitialized: true }));

  var userRouter = express.Router();
  var portfolioRouter = express.Router();
  var twitterRouter = express.Router();

  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.get('/', auth.signInIfNotAuthenticated);
  app.use('/index.html', auth.signInIfNotAuthenticated);
  app.use(express.static(path.join(__dirname,'/../../client')));

  app.use('/api/users', auth.authenticate, userRouter);

  app.get('/getgrowth', function(req, res){
    request('http://api.twittercounter.com/?apikey=2dc2e68f8a5190a63b2d4c8f4d8a53d8&twitter_id=17503180&output=JSONP', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage. 
        res.send(body);
      }
    })
  });

  app.use('/api/portfolio', auth.authenticate, portfolioRouter);
  // app.use('/api/portfolio', portfolioRouter);
  
  app.use('/api/twitter', auth.authenticate, twitterRouter);
  // app.use('/api/twitter', twitterRouter);

  app.get('/api/profileID', auth.authenticate, function(req, res){

    console.log('going to get profileID', req.session.passport.user);

    res.json(req.session.passport.user);
    
  });

  require('../portfolio/portfolioRoutes.js')(portfolioRouter);

  // Passport initialization
  auth.init(passport);
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Passport Routes 
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/signin.html');
  });

  app.get('/auth/twitter', passport.authenticate('twitter'));
  
  app.get('/auth/twitter/callback', passport.authenticate('twitter',
    { successRedirect: '/', failureRedirect: '/login' }
  ));


  app.get('/test', function(req, res){
    console.log('at /test, session: ', req.session);
    res.send('get /test OK');
  })

  require("../external/twitterRoutes.js")(twitterRouter);   //injects twitterRouter into twitterRoutes.js
  // require("../users/userRoutes.js")(userRoutes);
  // var getDateCreated = function(){
  //   var test = { body: { twitterHandle: 'ladygaga'} };
  //   twitter.getUserInfo( test, { JSON: function(data){ 
  //     console.log('got a name:', data.name) }
  //   });
  //   // console.log('object response', obj);
  // }
  // getDateCreated();

}
