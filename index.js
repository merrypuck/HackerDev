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
// var Array = require('node-array');

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
  createdAt       : String
});

var Session = mongoose.model('Session', {
  userId      : String,
  valid       : String,
  createdAt     : String
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

var setSession = function(req, newSession, callback) {
  req.session.sid = newSession;
  callback();
};
var checkPassword = function(password, hashedPassword, callback) {
	callback(passwordHash.verify(password, hashedPassword));
}

var initialGithubRequest = function(github_access_url, callback) {
  request(github_access_url, function (error, response, body) {
    callback(body);
  });
}
var getPrimaryGithubEmail = function(emailList, callback) {
  for(var e = 0; e < emailList.length; e++) {
    if(emailList[e].primary === true) {
      callback(emailList[e].email);
    }
  }
  //scallback(emailList[0].email);
}

var getGithubData = function(access_token, callback) {
    sendGithubRequest("https://api.github.com/user", access_token, function(rawGithubUser) {
      sendGithubRequest("https://api.github.com/user/emails", access_token, function(email) {
        getPrimaryGithubEmail(JSON.parse(email), function(primaryEmail) {
          var githubUser = JSON.parse(rawGithubUser);
          githubUser['primaryEmail'] = primaryEmail;
          console.log('primaryEmail');
          getScoreData(access_token, function(scoreData) {
            githubUser['scoreData'] = scoreData;
            githubUser['scoreData']['followers'] = githubUser['followers'];
            githubUser['scoreData']['totalRepos'] = githubUser['public_repos'];
            githubUser['scoreData']['creationYear'] = githubUser['created_at'].substring(2, 4);
            determineScore(githubUser['scoreData'], function(totalPoints) {
              githubUser['totalPoints'] = totalPoints;
              console.log(totalPoints);
              callback(JSON.stringify((githubUser)));
            });
          });
          //callback(JSON.stringify((githubUser)));
        });
      });
    });
}

var getContributors = function(repos, access_token, callback) {
  var scoreData = {};
  var totalStars = 0;
  var contributorsLength = 0;
 
  for(var r = 0; r < repos.length; r ++) {
    totalStars = totalStars + repos[r].stargazers_count;
    !function getContributorsRepos(rr){
        sendGithubRequest(repos[r].contributors_url, access_token, function(rawContributors) {
          if(rawContributors) {
            var contributors = JSON.parse(rawContributors);
            contributorsLength = contributorsLength + contributors.length;
            //console.log(contributorsLength);
          }
          if(rr === repos.length - 1) {
            scoreData['totalStars']        = totalStars;
            scoreData['contributorLength'] = contributorsLength;
            callback(scoreData)
          }

      });
    }(r)
  };
}
var getScoreData = function(access_token, callback) {
  
  // get repos
  sendGithubRequest("https://api.github.com/users/Aaln/repos", access_token, function(rawRepos) {
    var repos = JSON.parse(rawRepos);
    console.log('repos');
    getContributors(repos, access_token, function(scoreData) {
      callback(scoreData);
    });
    
  });
}


var determineScore = function(scoreData, callback) {
 // Total Stars - max 200 (-20) -- 10
 // Number of followers - m 200 (-20) -- 10
 // *Total Repos  - m 50 (-10)  -- 5
 // Number of collaborators  - m 20 (-4) -- 5

 var totalStars = scoreData.totalStars;
 var totalRepos = scoreData.totalRepos;
 var followers = scoreData.followers;
 var contributorLength = scoreData.contributorLength;
 var creationYear = scoreData.creationYear;

 var totalPoints = 10;
 console.log(totalPoints);
  if(totalStars > 199) {
    totalPoints = totalPoints + 10;
  }
  else {
    totalPoints = totalPoints + Math.ceil(totalStars / 20);
    console.log(totalPoints);
  }

  if(totalRepos > 49) {
    totalPoints = totalPoints + 5;
    console.log(totalPoints);
  }
  else {
    totalPoints = totalPoints + Math.ceil(totalRepos / 10);
    console.log(totalPoints);
  }
  console.log(totalPoints);
  if(followers > 199) {
    totalPoints = totalPoints + 10;
  }
  else {
    totalPoints = totalPoints + Math.ceil(followers / 20);
    console.log(totalPoints);
  }
  if(contributorLength > 19) {
    totalPoints = totalPoints + 5;
  }
  else {
    totalPoints = totalPoints + Math.ceil(contributorLength / 4)
  }
  console.log(totalPoints);
  totalPoints = totalPoints + ((30 - totalPoints) * ((14 - creationYear) / 10));

  callback(totalPoints * 3);
}

var githubFollow = function(access_token) {
  var reqObj = {
    url: url,
    headers: {
      'User-Agent': 'hack',
      'Authorization' : 'token ' + access_token
    }
  };
  request(reqObj, function(error, response, body) {
    callback(body);
  });
}
var sendGithubRequest = function(url, access_token, callback) {
  var reqObj = {
    url: url,
    headers: {
      'User-Agent': 'hack',
      'Authorization' : 'token ' + access_token
    }
  };
  request(reqObj, function(error, response, body) {
    callback(body);
  });
};

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


app.get('/score1', function(req, res) {
  res.render('score1');
});
app.get('/score2', function(req, res) {
  res.render('score2');
});
app.get('/scoredemo', function(req, res) {
  res.render('scoredemo');
});

app.get('/personal', function(req, res) {
  res.render('personal');
});
app.get('/:username', function(req, res) {
  console.log(req.session.sid);
  var username = req.params.username.toLowerCase();
  if(req.session.sid) {
    checkSession(req.session.sid, function(userObj) {
      if(userObj !== false) {
        if(userObj.username === username) {
          res.render('score2-prod', {
            userObj : userObj
          });
        }
        else {
          User.findOne({'username' : username}, function(err, userObj) {
            if(!userObj) {
              res.send("Err, user not found.");
            }
            else {
              res.render('score2-prod', {
                userObj : userObj
              });
            }
          });
        }
      }
      else {
        res.redirect('/');
      }
    });
    
    
  }
  else {
    User.findOne({'username' : username}, function(err, userObj) {
      if(!userObj) {
        res.send("Err, user not found.");
      }
      else {
        res.render('score2-prod', {
          userObj : userObj
        });
      }
    });
  }
});


app.get('/github/callback', function(req, res) {
  var code = req.query.code;
  var github_access_url = "https://github.com/login/oauth/access_token?client_id=" + github_client_id + "&client_secret=" + github_client_secret + "&code=" + code;
  console.log('callback called');
  initialGithubRequest(github_access_url, function(body) {
    console.log('github request');
    var body = querystring.parse(body);
    var access_token = body.access_token;
    console.log(access_token);
    getGithubData(access_token, function(githubUser) {
      console.log(githubUser);
      var githubUser = JSON.parse(githubUser);
      User.findOne({'email': githubUser.primaryEmail}, function(err, userObj) {
        githubUser['isUser'] = true;
        if(err) {
          console.log(err);
        }
        console.log('found user');
        if(!userObj) {
          var user = new User({
            'name'        : githubUser.name,
            'email'       : githubUser.primaryEmail.toLowerCase(),
            'username'    : githubUser.login.toLowerCase(),
            'avatar_url'  : githubUser.avatar_url,
            'github_data' : githubUser,
            'createdAt'   : String(new Date()),
            'access_token': access_token
          });
          user.save(function(err, userObj) {

            if(err) {
              console.log(err);
            }
            newSession(userObj._id, function(sessionObj) {
              req.session.sid = sessionObj._id;
              res.redirect("/" + userObj.username);
            });
          });
       }
       else {
          newSession(userObj._id, function(sessionObj) {
            req.session.sid = sessionObj._id;
            res.redirect("/" + userObj.username);
          });
      }
        
    });
  
  });
  })
});

app.get('/dev/score1', function(req, res) {
  res.render('score');
});
app.get('/score', function(req, res) {
  var session = req.session.sid;
  checkSession(session, function(userObj) {
    if(!userObj) {
      res.render('score', {
        userObj : userObj
      });
    }
    else {
      res.redirect('/');
    }
  });
});


app.get('/flat', function(req, res) {
  res.render('flat');
});





app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

