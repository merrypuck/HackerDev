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
//var uuid 			= require('node-uuid');
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


var siteURL = "http://localhost:5000";

/**** GITHUB INIT *****/

var github_app_name = "hack";
var github_scope = [];
var github_state = "";
var github_base_url = "https://github.com/login/oauth/authorize";

// DEVELOPMENT
/*
var github_client_id = "a1e0413182e4bcb57cca";
var github_client_secret = "14393e6d4319a617f683c3f711f0c943dacf317c";
*/
// PRODUCTION

var github_client_id = "a1a676b0be2c4f013563";
var github_client_secret = "60cb4d2630131522b3ce39f7a3a30f234522444a";



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

mongoose.connect('mongodb://dave:aaron@kahana.mongohq.com:10046/hack');

var db = mongoose.connection;

// Error handling
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback() {
  console.log('Connected to DB');
});

var User = mongoose.model('User', {
	name 			      : String,
	email 			    : String,
	phone		 	      : String,
	password 		    : String,
	hasProfile	    : String,
	friends 		    : [],
  github_data     : {},
  github_token    : String
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

var getPrimaryGithubEmail = function(emailList, callback) {
  for(var e = 0; e < emailList.length; e++) {
    if(emailList[e].primary === true) {
      callback(emailList[e].email);
    }
  }
  callback(false);
}
// Facebook INIT
appId = 1457379081194444;
appSecret = "9838903221f77bc33f9f8dfe1f286089";

//////////////////////////////////
// Express handlers
/////////////////////////////////


app.get('/', function(req, res) {
	res.render('home', {
    client_id : github_client_id
  });
	
});
app.get('/github/callback', function(req, res) {
	var code = req.query.code;
	console.log(code);
	var github_access_url = "https://github.com/login/oauth/access_token?client_id=" + github_client_id + "&client_secret=" + github_client_secret + "&code=" + code;
	request(github_access_url, function (error, response, body) {
      if(error) {
        console.log(error);
      }
      else {
          var body = querystring.parse(body);
          var github_userdata_url = "https://api.github.com/user";
          var options1 = {
		        url: github_userdata_url,
		        headers: {
		          'User-Agent': 'hack',
              'Authorization' : 'token ' + body.access_token
		        }
		      };
          request(options1, function(error, response, body1) {
            var github_user = JSON.parse(body1);
            this.github_user = github_user;
            var github_orig = this;

          	if(error) {
          		console.log(error);
          	}
          	else {
              var github_useremail_url = "https://api.github.com/user/emails";
              var options2 = {
                url: github_useremail_url,
                headers: {
                  'User-Agent': 'hack',
                  'Authorization' : 'token ' + body.access_token
                }
              };
              request(options2, function(error, response, body2) {
                var githubEmailList = JSON.parse(body2);
                getPrimaryGithubEmail(githubEmailList, function(primaryEmail) {
                  User.findOne({'email' : primaryEmail}, function(err, userObj) {
                    console.log(github_orig.github_user);
                    if(!userObj) {
                      var user = new User({
                        name : github_orig.github_user.name,
                        email : primaryEmail,
                        github_token : body.access_token,
                        github_data : String(github_orig.github_user)
                      });
                      user.save(function(err) {
                        if(err) {
                          console.log(err);
                        }
                        else {
                          res.render('score', {
                            userObj : userObj,
                            profileUrl : github_orig.github_user.avatar_url
                          });
                        }
                       
                      });
                    }
                    else {
                      res.render('score', {
                          userObj : userObj,
                          profileUrl : github_orig.github_user.avatar_url
                        });
                    }

                });
              });
            });
          		
          	}
          });
      }
    });
});

app.get('/score', function(req, res) {
  res.render('score');
});
app.get('/flat', function(req, res) {
  res.render('flat');
});





app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

