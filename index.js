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

var siteURL = "http://letshack.herokuapp.com";

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



// Facebook INIT
appId = 188879964608233;
appSecret = "45cd267a90d70fb997692fc003cef1e5";


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
          getScoreData(githubUser.login, access_token, function(scoreData) {
            githubUser['scoreData'] = scoreData;
            githubUser['scoreData']['followers'] = githubUser['followers'];
            githubUser['scoreData']['totalRepos'] = githubUser['public_repos'];
            githubUser['scoreData']['creationYear'] = githubUser['created_at'].substring(2, 4);
            determineScore(githubUser['scoreData'], true, function(totalPoints) {
              githubUser['totalPoints'] = totalPoints;
              if(totalPoints > 80) {
                githubUser['top'] = "10";
              }
              else if(totalPoints > 70) {
                githubUser['top'] = "20";
              }
              else if(totalPoints > 50) {
                githubUser['top'] = "30";
              }
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
var getScoreData = function(username, access_token, callback) {
  
  // get repos
  sendGithubRequest("https://api.github.com/users/" + username + "/repos", access_token, function(rawRepos) {
    var repos = JSON.parse(rawRepos);
    getContributors(repos, access_token, function(scoreData) {
      callback(scoreData);
    });
    
  });
}


var determineScore = function(scoreData, isUser, callback) {
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
  if(totalStars > 199) {
    totalPoints = totalPoints + 10;
  }
  else {
    totalPoints = totalPoints + Math.ceil(totalStars / 20);
  }

  if(totalRepos > 49) {
    totalPoints = totalPoints + 5;
  }
  else {
    totalPoints = totalPoints + Math.ceil(totalRepos / 10);
  }
  
  if(contributorLength > 19) {
    totalPoints = totalPoints + 5;
  }
  else {
    totalPoints = totalPoints + Math.ceil(contributorLength / 4)
  }

  if(isUser) {
    if(followers > 199) {
      totalPoints = totalPoints + 10;
    }
    else {
      totalPoints = totalPoints + Math.ceil(followers / 20);
    }
    
  }
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

var saveUnregisteredGithubUsers = function(username, users, access_token) {
  for(var r = 0; r < users.length; r ++) {
    !function getUnregisteredUsers(rr){
        User.findOne({'username' : users[rr].login}, function(err, userObj) {
          if(userObj) {
            return null;
          }
          else {
            sendGithubRequest("https://api.github.com/users/" + users[rr].login, access_token, function(githubUser) {
              var githubUser = JSON.parse(githubUser);
              if(!githubUser.name) {
                githubUser.name = githubUser.login;
              }
              getScoreData(users[rr].login, access_token, function(scoreData) {

                githubUser['scoreData'] = scoreData;
                githubUser['isUser'] = false;
                githubUser['scoreData'] = scoreData;
                githubUser['scoreData']['followers'] = githubUser['followers'];
                githubUser['scoreData']['totalRepos'] = githubUser['public_repos'];
                githubUser['scoreData']['creationYear'] = githubUser['created_at'].substring(2, 4);
                determineScore(githubUser['scoreData'], false, function(totalPoints) {
                  githubUser['totalPoints'] = totalPoints;
                    if(totalPoints > 80) {
                      githubUser['top'] = "10";
                    }
                    else if(totalPoints > 70) {
                      githubUser['top'] = "20";
                    }
                    else if(totalPoints > 50) {
                      githubUser['top'] = "30";
                    }
                    var user = new User({
                      'name'        : githubUser.name,
                      'username'    : githubUser.login.toLowerCase(),
                      'avatar_url'  : githubUser.avatar_url,
                      'github_data' : githubUser,
                      'createdAt'   : String(new Date()),
                      'visitors'    : 0,
                      'friend'      : username
                    });
                    user.save(function(err, userObj) {

                      if(err) {
                        console.log(err);
                      }
                      return true;
                    });

              });
                
              });
            });
          }
        });
    }(r)
  };
}

var saveFollowing = function(username, access_token) {
  sendGithubRequest("https://api.github.com/users/" + username + "/following", access_token, function(rawUsers) {
    var users = JSON.parse(rawUsers);
    saveUnregisteredGithubUsers(username, users, access_token);
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

var generateFacebookUrl = function(userId) {
  var redirect_uri = siteURL + "login/" + userId + "/callback";
  var facebookUrl = "https://www.facebook.com/dialog/oauth?response_type=code&redirect_uri=" + redirect_uri + "&client_id=" + appId + "&scope=email%2C%20user_about_me%2C%20user_website%2C%20read_friendlists%2C%20user_friends%2C%20friends_about_me";
  return facebookUrl
}

var getFacebookAccessToken = function(code, userId, callback) {
  var url1 = "https://graph.facebook.com/oauth/access_token?client_id=" + appId + "&client_secret=" + appSecret + "&code=" + code + "&redirect_uri=" + generateFacebookUrl(userId);
  request(url1, function (error, response, body) {
    if(error) {
      console.log(error);
    }
    else {
      var body = querystring.parse(body);
      console.log(body);
      var url2 = "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=" + appId + "&client_secret=" + appSecret + "&fb_exchange_token=" + body.access_token;
      request(url2, function (error, response, body1) {
        if(error) {
          console.log(error);
        }
        else {
          /*
          var accessToken = body2.access_token;
          gatherFacebookData(req, accessToken, function(userData) {
            var userData = querystring.stringify(userData);
            var userData = encodeURIComponent(userData);
            var redirectUrl = appObj.callbackUrl + "?user=" + userData;
            return res.redirect(redirectUrl);
          });*/
          var body1 = querystring.parse(body1);
          console.log(body1);
          callback(body.access_token);
        }
      });
    }
  });
}
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
    var url = 'https://graph.facebook.com/v1.0/me/friends?access_token=' + access_token + "&fields=name,picture";
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

var anotherVisitor = function(username) {
  User.findOne({'username' : username}, function(err, userObj) {
    var newVisitorCount = userObj.visitors + 1;
    User.update({'username': username}, {
      'visitors' : newVisitorCount
    }, function(err) {
      return true;
    });
  });
}
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
/*
app.get('/personal', function(req, res) {
  res.render('personal');
});
*/
app.get('/login/:userId/callback', function(req, res) {
  var userId = req.params.userId;
  var code = req.query.code;
  User.findOne({'_id' : userId}, function(err, userObj) {
    if(userObj) {
      getFacebookAccessToken(code, userId, function(accessToken) {
        if(accessToken) {
          var user = {};
          getFacebookData(req, '', accessToken, function(userData) {
            var userData = JSON.parse(userData);
            user.profileData = userData;
            getFacebookData(req, 'picture', accessToken, function(userProfilePicture) {
              user.picture = userProfilePicture;
               getFacebookData(req, 'friends', accessToken, function(userFriends) {
                var userFriends = JSON.parse(userFriends);
                user.friends = userFriends
                res.send(user);
              });
            })
          });
        }
      });
    }
    else {
      
    }
    
  });
});



app.get('/:username/improve', function(req, res) {
  User.findOne({'username' : req.params.username}, function(err, userObj) {
    res.render('improve', {
      userObj : userObj
    });
  });

});


app.get('/:username', function(req, res) {
  var username = req.params.username.toLowerCase();
  if(req.session.sid) {
    checkSession(req.session.sid, function(userObj) {

      if(userObj !== false) {
        if(userObj.username === username) {
          
          User.find({'friend' : username}, function(err, friends) {
            var allFriends = [];
            if(friends) {
              for(var f = 0; f < friends.length; f++) {
                allFriends.push({
                  'name' : friends[f].name,
                  'username' : friends[f].username,
                  'avatar_url' : friends[f].avatar_url,
                  'totalPoints' : friends[f].github_data.totalPoints
                })
              }
            
            res.render('personal-prod', {
              facebookUrl : generateFacebookUrl(userObj._id),
              userObj : userObj,
              friends : []
            });
          }
          
        });
        }
        else {
          User.findOne({'username' : username}, function(err, userObj) {
            if(!userObj) {
              res.redirect('/');
            }
            else {
              anotherVisitor(username);
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
        res.redirect('/');
      }
      else {
        anotherVisitor(username);
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
  initialGithubRequest(github_access_url, function(body) {
    console.log('github request');
    var body = querystring.parse(body);
    var access_token = body.access_token;
    console.log(access_token);
    getGithubData(access_token, function(githubUser) {
      var githubUser = JSON.parse(githubUser);
      User.findOne({'email': githubUser.primaryEmail}, function(err, userObj) {
        githubUser['isUser'] = true;
        if(err) {
          console.log(err);
        }
        if(!githubUser.name) {
          githubUser.name = githubUser.login;
        }
        if(!userObj) {
          var user = new User({
            'name'        : githubUser.name,
            'email'       : githubUser.primaryEmail.toLowerCase(),
            'username'    : githubUser.login.toLowerCase(),
            'avatar_url'  : githubUser.avatar_url,
            'github_data' : githubUser,
            'createdAt'   : String(new Date()),
            'access_token': access_token,
            'visitors'    : 0
          });
          user.save(function(err, userObj) {
            saveFollowing(userObj.username, access_token);
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
          if(userObj.isUser) {
            newSession(userObj._id, function(sessionObj) {
              req.session.sid = sessionObj._id;
              res.redirect("/" + userObj.username);
            });
          }
          else {
            User.update({'_id': userObj._id}, {
              'access_token': access_token, 
              'github_data' : githubUser,
              'email'       : githubUser.primaryEmail.toLowerCase()
            }).exec(function(err) {
              newSession(userObj._id, function(sessionObj) {
                req.session.sid = sessionObj._id;
                res.redirect("/" + userObj.username);
              });
            });
          }
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

app.post('/savecompany', function(req, res) {
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var email = req.body.email;
  var company = req.body.company;
  var users_id = req.body.users_id;
  var users_name = req.body.users_name;

  var company = new Company({
    first_name : first_name,
    last_name : last_name,
    email    : email,
    company : company,
    users_id : users_id,
    users_name : users_name
  });
  console.log(company);
  company.save(function(err, companyObj) {

  });
  res.send('true');
  


});

app.get('/flat', function(req, res) {
  res.render('flat');
});





app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

