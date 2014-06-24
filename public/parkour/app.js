console.log("The script loads");

var socket = io.connect('http://localhost:5000');
socket.on('instagram', function(jsonString){
	console.log("socket io message started");
});

socket.emit('ready');