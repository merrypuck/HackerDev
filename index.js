var express     = require('express.io');
var app       = express();
var request     = require('request');
var moment      = require('moment');
var _         = require('lodash');
var fs        = require('fs');
var http      = require('http');
var mongoose    = require('mongoose');
var connect     = require('connect');
var json      = require('json');
var bodyParser    = require('body-parser')
var csv       = require("fast-csv");
var querystring   = require('querystring');



//////////////////////////////////
// Express app config
/////////////////////////////////
app.http().io();

app.configure(function(){
  app.set('port', (process.env.PORT || 5000));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.static(__dirname + '/public'))
  app.set('view options', {layout: false});
  app.use(express.cookieParser('cookieKey81472321530089'));
  app.use(express.session({
    secret: 'sessionSecretKey1238147530089',
    cookie: {maxAge : 7200000} // Expiers in 2 hours
    }));
  app.use(express.bodyParser());
  app.use(express.favicon()); 
  app.use(express.methodOverride());
});
/********************* MONGOOSE INIT ****************************/
mongoose.connect('mongodb://dave:aaron@kahana.mongohq.com:10046/hack');


var db = mongoose.connection;

// Error handling
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback() {
  console.log('Connected to DB');
});

var User = mongoose.model('User', {
	name 			      : String,
  username        : String,
	email 			    : String,
	phone		 	      : String,
	password 		    : String,
	hasProfile	    : String,
  avatar_url      : String,
	friends 		    : [],
  github_data     : {},
  github_token    : String,
  createdAt       : String,
  visitors        : Number,
  friend          : String
});

var Session = mongoose.model('Session', {
  userId      : String,
  valid       : String,
  createdAt     : String
});
var Company = mongoose.model('CompanyPennapps', {
  
  email   : String,
  company_website : String,
  personal_website : String
});

var Website = mongoose.model('Website', {
  website : String,
  email : String
});

var Pennapps = mongoose.model('Pennapps', {
  companyImage: String,
  companyWebsite : String
});

function parseData() {}

//////////////////////////////////
// Express handlers
/////////////////////////////////


app.get('/', function(req, res) {
  var allSites = [];
  var threeSites = [];
  var count = 0;
  Pennapps.find({}, function(err, sites) {
    for(var s in sites) {
      if(count < 3) {
        threeSites.push(sites[s]);
        count = count + 1;
      }
      else {
        allSites.push(threeSites);
        threeSites = [];
        count = 0;
      }

    }
    res.render('index', {
      allSites : allSites,
      sites : sites
    });
    
  });
});

app.get('/review_all', function(req, res) {
  Website.find({}, function(err, sites) {
    res.render('review_all', {
      sites : sites
    });
  });
  
});
app.get('/review', function(req, res) {

  res.render('review_web');
});

app.post('/review', function(req, res) {

});

app.get('/pennapps', function(req, res) {
  res.render('index');
});

app.get('/fullscreen', function(req, res) {
  res.render('fullscreenform');
});
/*
app.post('/webdetails', function(req, res) {
  var website_url = req.body.website_url;
  driver.get(website_url);
  driver.getPageSource().then(function(source) {
    console.log(source);
    
  });
});
*/

app.post('/easyform/email', function(req, res) {
  var email = req.body.email;
});
/*
app.get('/easyform/website', function(req, res) {
  var website = req.query.website;
  driver.get(website);
  driver.getPageSource().then(function(source) {
    res.send(page);
  });

});
*/
/*
Company.findOne({'company_url' : 'quicxey'}, function(err, obj) {
  console.log(obj);
});
*/
app.post('/newcompany', function(req, res) {

  var email = req.body.email;
  var company_website = req.body.company_website;
  var personal_website = req.body.personal_website;
  console.log(company_website);
  var company = new Company({
    email : email,
    company_website : company_website,
    personal_website : personal_website

  });
  company.save(function(err) {
    res.send('true');
  });
});


app.post('/newwebsite', function(req, res) {
  var website_url = req.body.website_url;
  var email = req.body.email;
  var website = new Website({
    website : website_url,
    email : email
  });
  website.save(function(err) {
    if(err) {
      console.log(err);
    }
    res.send('true');
  });
  
});







app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

