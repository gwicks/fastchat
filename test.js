var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);

function getId(arr, id){
	for(var i = 0; i<arr.length; i++){
		if(arr[i].idNum===id){
			return arr[i];
		}
	}
	return null;
}

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
		var val = socket.id;
		userIds.arr.push({"idNum": val, "userName": name});
	});
	socket.on('disconnect', function(){
		numUsers--;
		console.log(getId(userIds.arr, socket.id).userName + ": Left");
		console.log("Number of Users: " + numUsers);
		for(var j = 0; j<userIds.arr.length; j++){
			if(userIds.arr[j].idNum===socket.id){
				userIds.arr.splice(j,1);
			}
		}
	})
	socket.on('chat message', function(message){
		if(message=='/erase'){
			io.emit('erase chat');
			chatMessages = [];
		}
    else if (message=='/hannah') {
            io.emit('hannah', {"id":getId(userIds.arr, socket.id).userName});
    }
    else if (message=='/shrug') {
            io.emit('shrug', {"id":getId(userIds.arr, socket.id).userName});
    }
    else if (message=='/numusers') {
            io.emit('numusers', {"count":numUsers});
    }
		else{
			io.emit('chat message', {"message":message, "id":getId(userIds.arr, socket.id).userName});
			chatMessages.push(getId(userIds.arr, socket.id).userName + ": " + message);
      console.log(getId(userIds.arr, socket.id).userName  + ": " + message);
		}
	});
});

http.listen(8083,"0.0.0.0", function(){
	console.log("listening on *.8083");
});
