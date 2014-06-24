console.log("The script loads");

var socket = io.connect('http://localhost:5000');
socket.on('zazti_notices', function(jsonString){
	console.log("socket io zazti notice received");
});

socket.emit('ready');