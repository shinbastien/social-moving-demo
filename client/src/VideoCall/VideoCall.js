import React, { useState, useEffect, useRef } from "react";

import Peer from "simple-peer";
import { StyledVideo, Video, videoConstraints } from "./videostyle";
import { useSocket } from "../lib/socket";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import {
	createPeer,
	addPeer,
	disconnectPeer,
	PeeraddStream,
} from "../lib/peer/peers";
import IconButton from "@mui/material/IconButton";
import styled from "styled-components";
import { faStream } from "@fortawesome/free-solid-svg-icons";

// Main handles connection between users and sends those to other pages

const SOCKET_SERVER_URL = "https://social-moving.herokuapp.com/";

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

const TextWrapper = styled.span`
	display: flex;
	justify-content: center; /* align horizontal */
	align-items: center; /* align vertical */
`;

function VideoCall(props) {
	// let is_ncons location = useLocation();const location = useLocation();const location = useLocation();const location = useLocation();const location = useLocation();ew = true;
	// const location = useLocation();
	// const {groupID, userName}= location.state;
	// const [users, setUsers] = useState([]);
	// const [stream, setStream] = useState();
	// var myPeerConnection = null;
	// var mystream = null;
	const [peers, setPeers] = useState({});
	const [isNew, setIsNew] = useState(true);
	// const socket = useRef();
	const { socket, connected } = useSocket();
	console.log("peers is: ", peers);
	const userVideo = useRef();
	const peersRef = useRef([]);
	const [participants, setParticipants] = useState([]);
	const roomName = props.roomName;
	const userName = props.userName;
	const delay = require("delay");
	// excluding chat functions for a second
	// const { chat, sendMessage, removeMessage } = useChat(groupID, userName);
	// const ChatRef = useRef();
	// 생각하는 상태를 binary (isnew/ isnew 아닌 것 두가지밖에 없는데) 카메라를 받아왔을 수도 있고, 아닐수도 있고, 분기점이 많다 => binary로 하려다보니 복잡하다. 필요한 조건들이 있을텐데, diagram으로 그리고

	// 그걸 가지고 hook을 걸어가지고 하면 될 것 같다.
	// 가장 간단한 방법은 카메라 요청을 유저에게 받고 비디오 승인을 받은 다음에 join 하자 useEffect 훅을 stream에 걸어놓고 stream 이 생기면, if 문으로 undefined가 아니면 socekt으로 emit을 해라 useEffect hook을 분리해도 돼
	// 여러 hook으로 분리해서 stream이랑 socket 2개만 다루고, socket이 있고 join room하고 stream을 별도로 넣어서 peer connection을 만들면 될 것이다.
	// 그걸 가지고 hook을 걸어가지고 하면 될 것 같다.
	// 가장 간단한 방법은 카메라 요청을 유저에게 받고 비디오 승인을 받은 다음에 join 하자 useEffect 훅을 stream에 걸어놓고 stream 이 생기면, if 문으로 undefined가 아니면 socekt으로 emit을 해라 useEffect hook을 분리해도 돼
	// 여러 hook으로 분리해서 stream이랑 socket 2개만 다루고, socket이 있고 join room하고 stream을 별도로 넣어서 peer connection을 만들면 될 것이다.

	// Set socket connection
	useEffect(() => {
		const handleJoinParticipants = async (members) => {
			console.log("isnew is", isNew);
			if (isNew) {
				setPeers((peers) => {
					return createPeer(roomName, userName, members, socket);
				});
				console.log("create peer for: ", userName);
				setIsNew(false);
			} else {
				setPeers((peers) => {
					return addPeer(roomName, userName, members, peers, socket);
				});

				console.log("add peer for: ", userName);
			}

			setParticipants([...participants, Object.keys(members)]);
		};

		if (socket && connected) {
			socket.on("joinResponse", handleJoinParticipants);
		}
		return () => {
			if (socket && connected) {
				socket.off("joinResponse", handleJoinParticipants);
			}
		};
	}, [isNew, socket, connected]);

	useEffect(() => {
		console.log("\n\n\t Test Peers", peers);
	}, [peers]);

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({ video: videoConstraints, audio: true })
			.then((stream) => {
				userVideo.current.srcObject = stream;
				setPeers((peers) => {
					return PeeraddStream(peers, stream);
				});
			})
			.catch(handleGetUserMediaError);
	}, [participants]);

	function handleGetUserMediaError(e) {
		switch (e.name) {
			case "NotFoundError":
				alert(
					"Unable to open your call because no camera and/or microphone" +
						"were found.",
				);
				break;
			case "SecurityError":
			case "PermissionDeniedError":
				// Do nothing; this is the same as the user canceling the call.
				break;
			default:
				alert("Error opening your camera and/or microphone: " + e.message);
				break;
		}
	}

	useEffect(() => {
		const handleRTCAnswer = async (offerer, receiver, data) => {
			try {
				if (receiver === userName) {
					while (!Object.keys(peers).includes(offerer)) {
						await delay(100);
					}
					console.log("signal offerer is: ", offerer);
					peers[offerer].peer.signal(data);
				}
			} catch (error) {
				console.log(error);
			}
		};
		const handleDisconnectResponse = (participants, userName) => {
			setParticipants(participants);
			console.log("disconnect Peer of :", userName);
			setPeers((peers) => {
				return disconnectPeer(peers, userName);
			});
		};
		if (socket && connected) {
			socket.on("RTC_answer", handleRTCAnswer);
			socket.on("disconnectResponse", handleDisconnectResponse);
		}

		return () => {
			if (socket && connected) {
				socket.off("RTC_answer", handleRTCAnswer);
				socket.off("disconnectResponse", handleDisconnectResponse);
			}
		};
	}, [participants, socket, connected]);

	function handleGetUserMediaError(e) {
		switch (e.name) {
			case "NotFoundError":
				alert(
					"Unable to open your call because no camera and/or microphone" +
						"were found.",
				);
				break;
			case "SecurityError":
			case "PermissionDeniedError":
				// Do nothing; this is the same as the user canceling the call.
				break;
			default:
				alert("Error opening your camera and/or microphone: " + e.message);
				break;
		}
	}

	return (
		<div>
			현재 접속자 수: {Object.keys(peers).length + 1} 명
			<Grid container>
				<Grid item style={{ padding: "1.5rem" }}>
					<StyledVideo
						muted
						ref={userVideo}
						autoPlay
						playsInline
						id={props.userName}
					/>
					{/* {console.log("1", peers)} */}
					<Grid container direction="row" justifyContent="space-between">
						<Grid item>
							<Stack direction="row" spacing={2}>
								<Avatar sx={{ bgcolor: "#ff4e6c" }}>
									{props.userName.slice(0, 1).toUpperCase()}
								</Avatar>
								<TextWrapper>
									{props.userName} &nbsp; &nbsp;
									<span style={{ color: "red" }}>나</span>
								</TextWrapper>
							</Stack>
						</Grid>
						<Grid item>
							<IconButton onClick={() => console.log("test")}></IconButton>
						</Grid>
					</Grid>
				</Grid>
				{Object.keys(peers).map((key) => {
					return (
						<Grid item key={key} style={{ padding: "1.5rem" }}>
							<Video peer={peers[key].peer} userName={key} />
							<Grid item>
								<Stack direction="row" spacing={2}>
									<Avatar sx={{ bgcolor: "#ff4e6c" }}>
										{key.slice(0, 1).toUpperCase()}
									</Avatar>
									<TextWrapper>{key} &nbsp; &nbsp;</TextWrapper>
								</Stack>
							</Grid>
							<Grid item>
								{/* <IconButton onClick={() => console.log("test")}></IconButton> */}
							</Grid>
						</Grid>
					);
				})}
			</Grid>
		</div>
	);
}

export default VideoCall;

// Get Chat from Server
//   socket.current.on(NEW_CHAT_MESSAGE_EVENT, ({messageId, body, senderId, senderName, ownedByCurrentUser}) => {
//     const incomingMessage = {
//       ...{messageId, body, senderName, ownedByCurrentUser},
//       ownedByCurrentUser: senderId === socket.current.id,
//     };
//     setChat((chat) => [...chat, incomingMessage]);
//     console.log("2", chat);
//   });
