var express 		= require('express.io');
var app 			= express();
var request 		= require('request');
var moment 			= require('moment');
var _ 				= require('lodash');
var fs				= require('fs');
var http			= require('http');
var geolib 			= require('geolib');
var mongoose		= require('mongoose');
var connect 		= require('connect');
var bodyParser = require('body-parser')
var csv = require("fast-csv");

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

//////////////////////////////////
// Express app config
/////////////////////////////////

app.engine('ejs', require('ejs-locals'));//.renderFile);
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(express.bodyParser());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view options', {layout: "template.html"});
app.http().io();

var parking_file = "./examples/get_parking_lots.txt";

/********************* MONGOOSE INIT ****************************/

mongoose.connect('mongodb://abc:abc123@kahana.mongohq.com:10087/1000scientists');

var db = mongoose.connection;

// Error handling
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback() {
  console.log('Connected to DB');
});

var Job = mongoose.model('Job', { 
  question 	: String,
  labels	: [],
  answers	: [],
  max 		: Number
});

var Task = mongoose.model('Task', {
	jobId 		: String,
	completed   : String,                                                                    
	answers 	: String,
	question    : String,
	label 		: String,
	taskId 		: String
});

var CompletedTask = mongoose.model('CompletedTask', {
	taskId 		: String,
	answer     	: String
});
//////////////////////////////////
// Express handlers
/////////////////////////////////
app.get('/', function(req, res) {
	res.render('home')
  	
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

