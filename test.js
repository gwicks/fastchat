var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var random = require('random-js');
var engine = random.engines.mt19937().autoSeed();

function getId(arr, id){
	for(var i = 0; i<arr.length; i++){
		if(arr[i].idNum===id){
			return arr[i];
		}
	}
	return null;
}

function unique(a){
        a.sort();
        for(var i = 1; i < a.length; ){
            if(a[i-1].userName == a[i].userName){
                a.splice(i, 1);
            } else {
                i++;
            }
        }
        return a;
}

function getGiphy(query) {
    var endpoint = "http://api.giphy.com/v1/gifs/search?q=" + query + "&api_key=dc6zaTOxFJmzC";
    request(endpoint, function(error,response,body) {
       if (!error) {
        var rawJSON = JSON.parse(body);
        rawJSON = rawJSON["data"][0]["images"]["original"];
        var url = rawJSON["url"];
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
	++numUsers;
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
                userIds.arr = unique(userIds.arr);
		console.log(name + " joined.");
                io.emit('update list', userIds.arr);
	});
	socket.on("add", function(message){
		chatMessages.push(message);
		io.emit('info message', message);
	});
	socket.on('disconnect', function(){
		if(numUsers > 0) {
			--numUsers;
		}
		else{
			console.log("nobody is in there");
		}

		for(var j = 0; j<userIds.arr.length; j++){
			if(userIds.arr[j].idNum===socket.id){
				userIds.arr.splice(j,1);
			}
		}
                userIds.arr = unique(userIds.arr);
                io.emit('update list', userIds.arr);
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
            chatMessages.push(getId(userIds.arr, socket.id).userName + ": <img src='http://33.media.tumblr.com/26bf203475c4f4350c6d837da9e25a3f/tumblr_mucnehOqeX1rby04wo1_1280.gif' /></li><br><br>");
    }
    else if (message==='/greg') {
            io.emit('greg', {"id":getId(userIds.arr, socket.id).userName});
            chatMessages.push(getId(userIds.arr, socket.id).userName + ": <img src='http://media.giphy.com/media/GFLcKd6MXid2M/giphy.gif' /></li><br><br>");
    }
    else if (message==='/reenu') {
            io.emit('reenu', {"id":getId(userIds.arr, socket.id).userName});
            chatMessages.push(getId(userIds.arr, socket.id).userName + ": <img src='http://media.giphy.com/media/PFXmxJoyTNfDG/giphy.gif' /></li><br><br>");
    }
    else if (message==='/shrug') {
            io.emit('shrug', {"id":getId(userIds.arr, socket.id).userName});
            chatMessages.push(getId(userIds.arr, socket.id).userName + ": <img src='http://media.giphy.com/media/y65VoOlimZaus/giphy.gif' /></li><br><br>");
    }
    else if (message==='/numusers') {
            io.emit('numusers', {"count":numUsers});
						chatMessages.push("OP: " + numUsers);
    }
		else if(message.indexOf("/changename")>-1){
			var name = message.slice(12,message.length);
			chatMessages.push(getId(userIds.arr, socket.id).userName + ": changed name to " + name + ".");
			io.emit('changename',{"newName":name, "oldName": getId(userIds.arr, socket.id).userName});
		}
    else if (message.indexOf('/giphy') > -1) {
            var content = message.split(' ');
            if (content.length > 1 && content[1] != '') {
                var content = content.slice(1);
                var endpoint = "http://api.giphy.com/v1/gifs/search?q=" + content.join('+') + "&api_key=dc6zaTOxFJmzC";
                request(endpoint, function(error,response,body) {
                    if (!error) {
                    var rawJSON = JSON.parse(body);
                    if (rawJSON["data"]) {
                        var selIndex = random.integer(0, (rawJSON["data"].length - 1))(engine);
                        rawJSON = rawJSON["data"][selIndex]["images"]["original"];
                        var url = rawJSON["url"];
		        chatMessages.push(getId(userIds.arr, socket.id).userName+ " " + content.join(' ')+ " " + "<img src='" + url + "' />");
                        io.emit('giphy', {"message":content.join(' '), "gurl":url, "id":getId(userIds.arr, socket.id).userName});
                    }
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


app.use(express.static(__dirname));

http.listen(8080,"0.0.0.0", function(){
	console.log("listening on *.8080");
});
