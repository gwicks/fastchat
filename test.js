var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var chatMessages = [];
var numUsers = 0;
var userIds = {arr:[]};
app.get('/', function(request, response){
	response.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	numUsers++;
	console.log("Number of Users: " + numUsers);
	console.log(socket.id);
	socket.emit('pageload', chatMessages);
	socket.on("username", function(name){
		userIds.arr.push({socket.id: name});
	});
	socket.on('disconnect', function(){
		numUsers--;
		console.log(socket.id + ": Left");
		console.log("Number of Users: " + numUsers);
	})
	socket.on('chat message', function(message){
		if(message=='/erase'){
			io.emit('erase chat');
			chatMessages = [];
		}
		else{
			io.emit('chat message', message);
			chatMessages.push(message);
            console.log(socket.id  + ": " + message);
		}
	});
});

http.listen(8083,"0.0.0.0", function(){
	console.log("listening on *.8083");
});
