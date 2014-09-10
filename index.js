var express 		= require('express.io');
var app 			= express();
var request 		= require('request');
var moment 			= require('moment');
var _ 				= require('lodash');
var fs				= require('fs');
var http			= require('http');
var mongoose		= require('mongoose');
var connect 		= require('connect');
var json 			= require('json');
var bodyParser 		= require('body-parser')
var csv 			= require("fast-csv");
var querystring 	= require('querystring');


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

mongoose.connect('mongodb://dave:aaron@candidate.37.mongolayer.com:10376,candidate.36.mongolayer.com:10376/lets_hack');

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
var Company = mongoose.model('Company', {
  first_name : String,
  last_name : String,
  company : String,
  email   : String,
  users_id  : String,
  users_name : String
});

//////////////////////////////////
// Express handlers
/////////////////////////////////


app.get('/', function(req, res) {
	res.render('index');
	
});





app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

