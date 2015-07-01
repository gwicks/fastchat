var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');

function getId(arr, id){
	for(var i = 0; i<arr.length; i++){
		if(arr[i].idNum===id){
			return arr[i];
		}
	}
	console.log("RETURNING NULL");
	return null;
}

function getGiphy(query) {
    var endpoint = "http://api.giphy.com/v1/gifs/search?q=" + query + "&api_key=dc6zaTOxFJmzC";
    request(endpoint, function(error,response,body) {
       if (!error) {
        var rawJSON = JSON.parse(body);
        rawJSON = rawJSON["data"][0]["images"]["original"];
        var url = rawJSON["url"];
        console.log(url);
        io.emit('giphy', {"message":query, "gurl":url, "id":getId(userIds.arr, socket.id).userName});
       } 
    });
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
	socket.emit('pageload', chatMessages);
	socket.on("username", function(name){
		var val = socket.id;
		if(getId(userIds.arr,socket.id)!==null){
			for(var j = 0; j<userIds.arr.length; j++){
				if(userIds.arr[j].idNum===socket.id){
					userIds.arr.splice(j,1);
				}
			}
		}
		userIds.arr.push({"idNum": val, "userName": name});
	});
	socket.on('disconnect', function(){
		numUsers--;
		console.log("Number of Users: " + numUsers);
		if(numUsers>0){
			if(getId(userIds.arr, socket.id)!==null){
				io.emit('left', getId(userIds.arr,socket.id).userName);
				console.log(getId(userIds.arr, socket.id).userName + ": Left");
			}
		}
		else{
			console.log("nobody is in there");
		}
		console.log("Number of Users: " + numUsers);
		for(var j = 0; j<userIds.arr.length; j++){
			if(userIds.arr[j].idNum===socket.id){
				userIds.arr.splice(j,1);
			}
		}
	});
	socket.on('chat message', function(message){
		if(chatMessages.length >100){
			chatMessages.splice(0,50);
			io.emit("cutmessages", chatMessages);
		}
		if(message=='/erase'){
			io.emit('erase chat');
			chatMessages = [];
		}
    else if (message==='/hannah') {
            io.emit('hannah', {"id":getId(userIds.arr, socket.id).userName});
    }
    else if (message==='/reenu') {
            io.emit('reenu', {"id":getId(userIds.arr, socket.id).userName});
    }
    else if (message==='/shrug') {
            io.emit('shrug', {"id":getId(userIds.arr, socket.id).userName});
            chatMessages.push(getId(userIds.arr, socket.id).userName + ": <img src='http://media.giphy.com/media/y65VoOlimZaus/giphy.gif' /></li><br><br>"); 
    }
    else if (message==='/numusers') {
            io.emit('numusers', {"count":numUsers});
    }
    else if(message==='/changename'){
	    io.emit('changename', {});
    }
    else if (message.indexOf('/giphy') > -1) {
            var content = message.split(' ');
            if (content.length > 1) {
                var content = content.slice(1);
                var endpoint = "http://api.giphy.com/v1/gifs/search?q=" + content.join('+') + "&api_key=dc6zaTOxFJmzC";
                console.log(endpoint);
                request(endpoint, function(error,response,body) {
                    if (!error) {
                    var rawJSON = JSON.parse(body);
                    rawJSON = rawJSON["data"][0]["images"]["original"];
                    var url = rawJSON["url"];
                    console.log(url);
                    io.emit('giphy', {"message":content.join(' '), "gurl":url, "id":getId(userIds.arr, socket.id).userName});
                } 
                });
            }
    }
    else {
	    io.emit('chat message', {"message":message, "id":getId(userIds.arr, socket.id).userName});
	    chatMessages.push(getId(userIds.arr, socket.id).userName + ": " + message);
    }
	});
});

http.listen(8083,"0.0.0.0", function(){
	console.log("listening on *.8083");
});
