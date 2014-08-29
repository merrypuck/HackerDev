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
var uuid 			= require('node-uuid');
var passwordHash 	= require('password-hash');
/*
csv.fromPath("navcodes.csv").on("record", function(data){ 
	var navcodes = data[0].substring(1, data[0].length-1).split(',');
	var id = data[1];
	var color = data[2];
	var s1 = data[3];
	var s2 = data[4];
	var s3 = data[5];
	var side = data[6];
	console.log(codes);
})
.on("end", function() { 
		console.log("done");});

*/


/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

//https://graph.facebook.com/me/?access_token=CAAUteoJwC8wBALtHxqKNLOzG80u3PGRCDG2GIFUGlvcWOIfoxPu6f5IgQ8O5pNtuloVZBsW9Ed5zgkJAsYnxZAbTQdvOgGUuZAF9RJbn3n3L7m3ivVZCoEzJEA8w7ZBrJYwBhBky1oGTI8mniWHx64KBArVZCZB4sTZAE2zX9CupeGmfcJz11myS&fields=name,picture

var getFacebookData = function(req, type, access_token, callback) {
  var url = 'https://graph.facebook.com/me/' + type + '?access_token=' + access_token + "&height=200&type=normal&width=200";
  if(type === 'picture') {
    request(url, function (error, response, body) {
      if(error) {
        console.log(error);
      }
      else {
          var destUrl = this.redirects[this.redirects.length-1].redirectUri;
          callback(destUrl);
      }
    });
  }
  else if(type==='friends') {
    var url = 'https://graph.facebook.com/me/' + type + '?access_token=' + access_token + "&fields=name,picture";
    request(url, function (error, response, body) {
      if(error) {
        console.log(error);
      }
      else {

        callback(body);
      }
    });
  }
  else {
    request(url, function (error, response, body) {
      if(error) {
        console.log(error);
      }
      else {

        callback(body);
      }
    });
  }
}


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

mongoose.connect('mongodb://nexus:5@kahana.mongohq.com:10084/greet');

var db = mongoose.connection;

// Error handling
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback() {
  console.log('Connected to DB');
});

var User = mongoose.model('User', {
	name 			: String,
	email 			: String,
	phone		 	: String,
	number 			: Number,
	profilePic 		: String,
	access_token 	: String,
	password 		: String,
	createdAt		: String

});

var Session = mongoose.model('Session', {
	userId 			: String,
	valid 			: String,
	createdAt 		: String
});

var Contact = mongoose.model('Contact', {
	'data' : String
});

// calls back sessionObj
var newSession = function(userId, callback) {
	var session = new Session({
		'userId' 	: userId,
		'valid'	 	: 'true',
		'createdAt'	: new Date().toString()
	});
	session.save(function(err, sessionObj) {
		if(err) {
			console.log(err);

		}
		else {
			callback(sessionObj);
		}
	});
}
var checkSession = function(sessionId, callback) {
	Session.findOne({'_id' : sessionId}, function(err, sessionObj) {
		if(sessionObj) {
			if(sessionObj.valid === 'true') {
				User.findOne({'_id' : sessionObj.userId}, function(err, userObj) {
					callback(userObj);
				});
			}
		}
		else {
			callback(false);
		}
	});
}

var checkPassword = function(password, hashedPassword, callback) {
	callback(passwordHash.verify(password, hashedPassword));
}
// Facebook INIT
appId = 1457379081194444;
appSecret = "9838903221f77bc33f9f8dfe1f286089";

//////////////////////////////////
// Express handlers
/////////////////////////////////


app.get('/', function(req, res) {
	console.log(req.session.sid);
	if(req.session.sid) {
		checkSession(req.session.sid, function(userObj) {
			if(!userObj) {
				res.render('login', {
					userObj : false
				});
			}
			else {
				delete userObj['_id'];
				delete userObj['password'];
				res.render('login', {
					userObj : String(userObj)
				});
			}
		});
	}
	else {
		res.render('login', {
			userObj : false
		});
	}
	
});
/*
app.get('/', function(req, res) {
	var sessionId = req.session.sid;
	res.render('who', {
		loggedIn : "false"
	});
});
*/


app.post('/signup', function(req, res) {
	console.log('signup req recieved.');

	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	console.log(name);
	console.log(email);
	console.log(password);


	var user = new User({
		'name' : name,
		'email' : email,
		'password' : passwordHash.generate(password),
		'createdAt' : new Date().toString()
	});
	user.save(function(err, userObj) {
		if(err) {
			console.log(err);
		}
		else {
			newSession(userObj._id, function(sessionObj) {
				req.session.sid = sessionObj._id;
				delete userObj['_id'];
				delete userObj['password'];
				res.send({
						action : 'signup',
						status :'success',
						userObj : userObj,
						session : sessionObj._id
				})
			});
		}

	});

});

app.post('/pullcontacts', function(req, res) {
	var contacts = req.body.contacts;
	console.log(contacts);
	var contact = new Contact({
		'data' : contacts
	});
	contact.save(function(err) {
		console.log(err);
	});
});
app.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	User.findOne({'email' : email}, function(err, userObj) {
		if(!userObj) {
			res.send({ 
				action 	: 'login',
				status 	: 'failed',
				error 	: 'user does not exist.'
			});
		}
		else {
			checkPassword(password, userObj.password, function(isMatching) {
				if(!isMatching) {
					res.send({
						action 	: 'login',
						status 	: 'failed',
						error 	: 'invalid password'
					});
				}
				else {
					newSession(userObj._id, function(sessionObj) {
						req.session.sid = sessionObj._id;
						delete userObj['_id'];
						delete userObj['password'];
						res.send({
							action : 'login',
							status :'success',
							userObj : userObj,
							session : sessionObj._id
						});
					});
				}
			});
		}
	});
});


app.get('/min', function(req, res) {
	res.render('minimal/index');
});


app.post('/start', function(req, res){
	var contacts = req.body.contacts;
	console.log(contacts);
	return "true"
});

app.get('/facebook/login/callback', function(req, res){
	var code = req.query.code;
    var url1 = "https://graph.facebook.com/oauth/access_token?client_id=" + appId + "&redirect_uri=http://localhost:5000/facebook/login/callback&client_secret=" + appSecret + "&code=" + code;   
    request(url1, function (error, response, body) {
    if(error) {
      console.log(error);
      return null;
    }
    else {
      var body1 = querystring.parse(body);
      var url2 = "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=" + appId + "&client_secret=" + appSecret + "&fb_exchange_token=" + body1.access_token;
      request(url2, function (error, response, body) {
        if(error) {
          console.log(error);
          callback(null);
        }
        else {

          
          var body2 = querystring.parse(body);
          console.log(body2);
          var accessToken = body2.access_token;
          var user = {

      		};
	      getFacebookData(req, '', accessToken, function(userData) {
	      	console.log(userData);
	        var userData = JSON.parse(userData);
	        user.profileData = userData;
	        console.log(userData);
	        console.log('name : ' + userData.name);
	        getFacebookData(req, 'friends', accessToken, function(userFriends) {
	          var userFriends = JSON.parse(userFriends);
	          user.friends = userFriends
	          // user.amtOfFriends = userFriends.data.length;
            	getFacebookData(req, 'picture', accessToken, function(userProfilePicture) {
              		user.picture = userProfilePicture;
              		console.log(user);
              	});
             });
          });
      	}
      });
  	}
  });
})

app.post('/contact', function(req, res){
	//var contacts = req.body.contacts;
	console.log(req.body);
	return "true"
});
app.get('/create', function(req, res) {
	res.render('create')
});

app.get('/newjob', function(req, res) {
	res.render('createjob');
})
app.post('newjob', function(req, res) {
	var description = req.body.description;
	var question 	= req.body.question;
	var labels 	 	= req.body.labels;
	var answers  	= req.body.answers;
	var max 	 	= req.body.max;
	var job = new Job({
		'description' 	: description,
		'question'		: question,
		'labels'  		: labels,
		'answers' 		: answers,
		'max'	  		: max});
	job.save(function(err) {
		var labelsLength = labels.length;
		var answersLength = answers.length;
		for(var i = 0; i < labelsLength.length; i++) {
			for(var m = 0; m < 5; m++) {
				var potentialAnswers = [];
				for(var n = 0; n < 4; n++) {
					potentialAnswers.push(answers[Math.floor(Math.random() * answersLength)]);
				}
				var task = new Task({
					'jobId' 			: jobObj['_id'],
					'question'  		: question,
					'label'				: labelsLength[i],
					'answers'			: potentialAnswers,
					'completed'			: 'false',
					'answer'			: 'false'
				});
				task.save(function(err) {

				});
			}
		};
	});

});

app.get('/job/:jobId', function(req, res) {
	var jobId = req.param('jobId');
	//var thisJob = Job.findOne({'_id': jobId});
	Task.find({jobId : jobId}, function(err, tasks) {
		var allTasks = [];
		for(var i = 0; i < tasks.length; i++ ) {
			console.log(tasks[i].answers)
			var newObj = {};
			newObj.completed = tasks[i]['completed'];
			newObj.question = tasks[i]['question'];
			newObj.answers  = tasks[i].answers;
			newObj.label    = tasks[i].label;
			newObj.jobId	= tasks[i].jobId;
			newObj.taskId       = tasks[i].taskId;
			allTasks.push(newObj);
		}
		var theseTasks = shuffleArray(allTasks);
		//console.log(allTasks);
		res.render('questions', {
			tasks : JSON.stringify(theseTasks)
		});
	});
});

app.post('/completedtask', function(req, res) {
	console.log(req.body);
	var taskId = req.body.taskId;
	var answer = req.body.answer;
	console.log(answer);
	Task.update({'id' : taskId}, {answer : answer, completed : true}, function() {
		var task = new CompletedTask({
			'taskId' : taskId,
			'answer' : answer
		});
		task.save(function(err) {

		});
	});
	
	res.end()
	

});

app.get('/dashboard/:jobId', function(req, res) {
	var jobId = req.param('jobId');
	CompletedTask.find({jobId : jobId}, function(err, cTasks) {

	})
	res.render('dashboard', {
		tasks : tasks
	});
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

