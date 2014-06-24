var express = require('express');
var app = express();
var request = require('request')
app.engine('ejs', require('ejs-locals'));//.renderFile);
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view options', {layout: "template.html"});

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/map', function(req, res) {
	res.render('map');
});

app.get('/direct', function(req, res) {

});
app.post('/direct', function(req, res) {
	var starting_location = req.body.starting_location;
	var end_location = req.body.end_location;
	var radius = req.body.radius;
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})