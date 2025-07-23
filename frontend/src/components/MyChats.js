import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import Chatbar from "./Chatbar";
import { useCallback } from "react";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { SelectedChat, User, Chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = useCallback(async () => {
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${User.token}`,
				},
			};
			const { data } = await axios.get("http://localhost:5000/chats", config);
			setChats(data);
		} catch (error) {
			toast({
				title: "Error Occurred!",
				description: "Failed to Load the chats",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
			console.log(error);
		}
	}, [User.token, setChats, toast]);


  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("UserInfo")));
    fetchChats();
  }, [fetchAgain, fetchChats]);

  return (
		<Box
			display={{ base: SelectedChat ? "none" : "flex", md: "flex" }}
			flexDir="column"
			alignItems="center"
			p={3}
			bg="white"
			w={{ base: "100%", md: "31%" }}
			borderRadius="lg"
			borderWidth="1px"
		>
			<Box
				pb={3}
				px={3}
				fontSize={{ base: "28px", md: "30px" }}
				fontFamily="Work sans"
				display="flex"
				w="100%"
				justifyContent="space-between"
				alignItems="center"
			>
				My Chats
				<GroupChatModal>
					<Button
						display="flex"
						fontSize={{ base: "17px", md: "10px", lg: "17px" }}
						rightIcon={<AddIcon />}
					>
						New Group Chat
					</Button>
				</GroupChatModal>
			</Box>
			<Box
				display="flex"
				flexDir="column"
				p={3}
				bg="#F8F8F8"
				w="100%"
				h="100%"
				borderRadius="lg"
				overflowY="hidden"
			>
				{Chats ? (
					<Stack overflowY="scroll">
						{Chats.map((chat) => (
							<div key={chat._id}>
								<Chatbar loggedUser={loggedUser} chat={chat} />
							</div>
						))}
					</Stack>
				) : (
					<ChatLoading />
				)}
			</Box>
		</Box>
	);
};

export default MyChats;
