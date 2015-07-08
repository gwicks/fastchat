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

function getName(arr, name){
	for(var i = 0; i<arr.length; i++){
		if(arr[i].userName===name){
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
		else if(message.substring(0,8)==='/whisper'){
			var whisper = message.slice(9, message.length);
			var arrTemp = whisper.split(" ");
			if(getName(userIds.arr, arrTemp[0])!==null){
				var socketId = getName(userIds.arr, arrTemp[0]).idNum;
				var mess = "";
				for(var a = 1; a<arrTemp.length; a++){
						mess+=arrTemp[a]+ " ";
				}
				io.sockets.connected[socketId].emit("whisper", {"message": mess, "sender":getId(userIds.arr,socket.id).userName});
				io.sockets.connected[socket.id].emit("whisperShow",{"message":mess, "sendee": arrTemp[0]});
			}
			else{
				io.sockets.connected[socket.id].emit("fail", "Your whisper to " + arrTemp[0] + " failed.");
			}
		}
		else if(message.substring(0,10)==='/tictactoe'){
			var challenge = message.slice(11, message.length);
			if(getName(userIds.arr, challenge)!==null){
				var socketId = getName(userIds.arr, challenge).idNum;
				var ticUrl = Math.floor(Math.random()*1000);
				app.get('/'+ticUrl, function(request, response){
					response.sendFile(__dirname + '/game.html');
				});
				io.sockets.connected[socketId].emit("tictactoe", {"message": getId(userIds.arr, socket.id).userName + "challenges you to a game of Tic Tac Toe!", "url":ticUrl});
				io.sockets.connected[socket.id].emit("tictactoe", {"message": "You challenged " + challenge + " to a game of Tic-Tac-Toe!", "url": ticUrl});


				io.sockets.connected[socketId].emit('tictactoeLoad', getId(userIds.arr, socket.id).userName);
				io.sockets.connected[socket.id].emit('tictactoeLoad', getId(userIds.arr, socket.id).userName);
			}
			else{
				io.sockets.connected[socket.id].emit("fail", "Your Tic-Tac-Toe challenge to " + challenge + " failed.");
			}
		}
		else if (message =="/scroll"){
						io.emit('scroll');
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
    else if (message.substring(0,5)==='/self') {
            var content = message.split(' ');
            if (content.length > 1 && content[1] != '') {
                content = content.slice(1);
                var message = content.join(' ');
                io.emit('user self', {"id":getId(userIds.arr, socket.id).userName, "message":message});
            }
    }
    else if(message.indexOf("/changename")>-1){
            var name = message.split(' ');
            if (name[1] && name[1].indexOf(' ') == -1) {
	        if (name.length > 1)
                {
                    name = name.slice(1);
                    name = name.join(' ');
                }
                else
                {
                    name = name[1];
                }
                var valid = true;
                for (var x = 0; x < userIds.arr.length; x++) {
                    if ( userIds.arr[x].userName == name)
                    {
                            valid = false;	
                            break;
                    }
                }
                if (valid) {
                    chatMessages.push(getId(userIds.arr, socket.id).userName + ": changed name to " + name + ".");
                    io.emit('changename',{"newName":name, "oldName": getId(userIds.arr, socket.id).userName});
                }
            }
    else if(message.substring(0,11)==="/changename"){
	    var name = message.slice(12,message.length);
	    var valid = true;
	    for (var x = 0; x < userIds.arr.length; x++) {
		if ( userIds.arr[x].userName == name)
		{
			valid = false;
		}
	    }
	    if (valid) {
	    	chatMessages.push(getId(userIds.arr, socket.id).userName + ": changed name to " + name + ".");
	    	io.emit('changename',{"newName":name, "oldName": getId(userIds.arr, socket.id).userName});
	    }
    }
    else if (message.substring(0,6)==='/giphy') {
            var content = message.split(' ');
            if (content.length > 1 && content[1] != '') {
                var content = content.slice(1);
                var endpoint = "http://api.giphy.com/v1/gifs/search?q=" + content.join('+') + "&api_key=dc6zaTOxFJmzC";
                request(endpoint, function(error,response,body) {
                    if (!error) {
                    var rawJSON = JSON.parse(body);
                    if (rawJSON["data"]) {
                        var selIndex = random.integer(0, (rawJSON["data"].length - 1))(engine);
                        if (rawJSON["data"][0]) {
                        rawJSON = rawJSON["data"][selIndex]["images"]["original"];
                        var url = rawJSON["url"];
		        chatMessages.push(getId(userIds.arr, socket.id).userName+ " " + content.join(' ')+ " " + "<img src='" + url + "' />");
                        io.emit('giphy', {"message":content.join(' '), "gurl":url, "id":getId(userIds.arr, socket.id).userName});
                        }
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
