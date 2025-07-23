import { Box, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { socket } from "../socket";
import { getSender } from "../config/ChatLogics";

const Chatbar = ({ loggedUser, chat }) => {
	const { SelectedChat, setSelectedChat } = ChatState();
	const [newMessageCounts, setNewMessageCounts] = useState(0);
	const [latestMessage, setLatestMessage] = useState(chat.latestMessage);

	const handleSelectChat = () => {
		setSelectedChat(chat);
		setNewMessageCounts(0);
	};

	useEffect(() => {
		socket.on("message recieved", (newMessageReceived) => {
			if (chat._id === newMessageReceived.chat._id && SelectedChat !== chat) {
				setNewMessageCounts((prevCount) => prevCount + 1);
				setLatestMessage(newMessageReceived);
			}
		});
		return () => {
			socket.off("message recieved");
		};
	}, [SelectedChat, chat]);

	return (
		<Box
			onClick={handleSelectChat}
			cursor="pointer"
			bg={SelectedChat === chat ? "#38B2AC" : "#E8E8E8"}
			color={SelectedChat === chat ? "white" : "black"}
			px={3}
			py={4}
			borderRadius="lg"
			position="relative"
		>
			<Text fontSize="md" mt={2} color="#2D3748" fontWeight="bold">
				{!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
			</Text>
			{latestMessage && (
				<Text
					fontSize="sm"
					mt={2}
					color="#4A5568"
					maxW="400px"
					whiteSpace="nowrap"
					overflow="hidden"
					textOverflow="ellipsis"
				>
					<span style={{ fontWeight: "bold", marginRight: "5px" }}>
						{chat.isGroupChat && (latestMessage.sender.name + ":")}
					</span>
					<span>{latestMessage.content}</span>
				</Text>
			)}
			{newMessageCounts > 0 && (
				<div
					style={{
						position: "absolute",
						top: "50%",
						right: "8px",
						transform: "translateY(-50%)",
						width: "24px",
						height: "24px",
						borderRadius: "50%",
						backgroundColor: "green",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						fontSize: "12px",
						color: "white",
						fontWeight: "bold",
					}}
				>
					{newMessageCounts}
				</div>
			)}
		</Box>
	);
};

export default Chatbar;
