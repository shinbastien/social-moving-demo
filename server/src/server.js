const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
	},
});


const port = process.env.PORT || 3000;
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const REMOVE_CHAT = "removeChat";

const users = {};
const userInfo = {};

// Socket.io connection for Chatting
io.on("connection", (socket) => {
	// Join a conversation
	// console.log(socket.handshake.query);
	// const {GroupID, userName} = socket.handshake.query;
	// console.log("1", GroupID);
	// console.log("2", userName);
	// socket.join(GroupID);

	socket.on("join", (roomName, userName) => {
		socket.join(roomName);
		if (!users[roomName]) {
			users[roomName] = { participants: {}, youtubeLink: "" };
		}
		socket.roomName = roomName;
		socket.userName = userName;
		users[roomName].participants[userName] = {
			socket: socket.id,
			location: [0, 0],
		};
		console.log(
			"current users after join: ",
			Object.keys(users[roomName].participants),
		);
		console.log(users[roomName].participants);
		io.to(roomName).emit("joinResponse", users[roomName].participants);
		console.log("server sends joinResponse");
	});

	// socket.on("start videocall", (GroupID) => {
	// 	console.log("groupID in videocall is: ", GroupID);
	// 	console.log("socket id is: ", socket.id);
	// 	console.log("current users is: ", users[GroupID]);
	// 	console.log("starting videocall for room");

	// 	// send list of group members to each member
	// 	socket.emit("bring all users in group for videocall", users[GroupID]);
	// });

	// --------------------PEERCONNECTION-------------------
	// when a peer is created from newbie, the created peer sends a signal by socket and socket sends the signal to existing peers
	socket.on("RTC_offer", (signal, caller, receiver, roomName) => {
		try {
			io.to(roomName).emit("RTC_answer", caller, receiver, signal);
			console.log("signal sended from newbie: ", caller);
			console.log("to: ", receiver);
		} catch (error) {
			console.log(error);
		}
	});

	socket.on("returning signal", (payload) => {
		io.to(payload.callerID).emit("receiving returned signal", {
			signal: payload.signal,
			callerID: socket.id,
			callerName: socket.userName,
		});
		console.log("returning signal to : ", payload.callerName);
	});

	//  ---------------------------SHAREVIDEO----------------------
	socket.on("start shareVideo", (videoID) => {
		console.log("starting sharevideo for room");
		socket.broadcast.to(socket.roomName).emit("start videoplayer", videoID);
	});

	socket.on("play", (userName) => {
		console.log("play video act by: ", userName);
		socket.broadcast.to(socket.roomName).emit("ShareVideoAction", "play");
	});

	socket.on("pause", (userName) => {
		console.log("pause video of groupID: ", userName);
		socket.broadcast.to(socket.roomName).emit("ShareVideoAction", "pause");
	});

	socket.on("load", (userName, videoID) => {
		console.log("load video of: ", userName);
		console.log("video Link is : ", videoID);
		socket.broadcast.to(socket.roomName).emit("ShareVideoAction", videoID);
	});

	// ------------------------MAP----------------------

	// socket connection for MapWindow
	socket.on("start mapwindow", (lat, lng) => {
		console.log("latitude is: ", lat);
		console.log("longitude is: ", lng);
		users[socket.roomName].participants[socket.userName].location = [lat, lng];
		console.log(
			"updated user info of current socket: ",
			users[socket.roomName].participants[socket.userName],
		);
	});

	// Listen for Emoji sending
	socket.on("send emoji", (emoji, userName) => {
		console.log("received emoji is: ", emoji);
		console.log("emoji sneder is: ", userName);
		io.to(socket.roomName).emit("get emoji", emoji, userName);
	});

	// CANVAS
	socket.on("start canvas", () => {
		socket.broadcast.to(socket.roomName).emit("open canvas");
		console.log("open canvas");
	});

	socket.on("start drawing", () => {
		console.log("Current user who is drawing: ", socket.userName);
		socket.broadcast.to(socket.roomName).emit("other start drawing");
	});
	socket.on("send paint", (mousePosition, newMousePosition) => {
		console.log("send paint of: ", socket.userName);
		socket.broadcast
			.to(socket.roomName)
			.emit("receive paint", mousePosition, newMousePosition);
	});

	socket.on("stop drawing", () => {
		console.log("user stopped drawing: ", socket.userName);
		socket.broadcast.to(socket.roomName).emit("other stopped drawing");
	});

	// Leave the room if the user closes the socket
	socket.on("disconnect", () => {
		console.log("socket disconnected");
		console.log("current socket is: ", socket.id);
		console.log("current socket room is: ", socket.roomName);
		console.log("current socket userName is: ", socket.userName);
		if (socket.roomName && socket.userName) {
			delete users[socket.roomName].participants[socket.userName];
			if (Object.keys(users[socket.roomName].participants).length === 0) {
				delete users[socket.roomName];
			} else {
				io.in(socket.roomName).emit(
					"disconnectResponse",
					users[socket.roomName].participants,
					socket.userName,
				);
			}
		}
		console.log("current users: ", users[socket.roomName]);
	});
});

server.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
