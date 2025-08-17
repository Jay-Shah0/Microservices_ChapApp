import { Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import { getSender } from "../config/ChatLogics";

const Chatbar = ({ loggedUser, chat }) => {
	const { SelectedChat, setSelectedChat,socket } = ChatState();
	const [newMessageCounts, setNewMessageCounts] = useState(0);
	const [latestMessage, setLatestMessage] = useState(chat.latestMessage);
	const [isTyping, setIsTyping] = useState(false);

	const handleSelectChat = () => {
		setSelectedChat(chat);
		setNewMessageCounts(0);
	};

	useEffect(() => {
		const handleNewMessage = (newMessageReceived) => {
			if (chat._id === newMessageReceived.chat._id && SelectedChat !== chat) {
				setNewMessageCounts((prevCount) => prevCount + 1);
				setLatestMessage(newMessageReceived);
			}
		};
		socket.on("message recieved", handleNewMessage);
		return () => {
			socket.off("message recieved", handleNewMessage);
		};
	}, [SelectedChat, chat]);

	useEffect(() => {
        const handleTyping = ({ chatId }) => {
            if (chatId === chat._id) {
                setIsTyping(true);
            }
        };
        const handleStopTyping = ({ chatId }) => {
            if (chatId === chat._id) {
                setIsTyping(false);
            }
        };

        socket.on('typing', handleTyping);
        socket.on('stop typing', handleStopTyping);

        return () => {
            socket.off('typing', handleTyping);
            socket.off('stop typing', handleStopTyping);
        };
    }, [chat._id]);

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
			{isTyping ? (
                <Text fontSize="sm" mt={2} color="green.500" fontStyle="italic">
                    Typing...
                </Text>
            ) : (
			latestMessage && (
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
			)
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
