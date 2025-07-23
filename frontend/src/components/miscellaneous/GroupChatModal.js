import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Button,
	useDisclosure,
	FormControl,
	Input,
	useToast,
	Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
	const { User, Chats, setChats } = ChatState();

	const { isOpen, onOpen, onClose } = useDisclosure();
	const [groupChatName, setGroupChatName] = useState();
	const [SelectedUsers, setSelectedUsers] = useState([User]);
	const [Search, setSearch] = useState("");
	const [SearchResult, setSearchResult] = useState([]);
	const [loading, setloading] = useState(false);
	const toast = useToast();

	const handleGroup = (userToAdd) => {
		if (userToAdd._id === User._id) {
			toast({
				title: "You are already in group",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			return;
		}
		if (SelectedUsers.includes(userToAdd)) {
			toast({
				title: "User already added",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		setSelectedUsers([...SelectedUsers, userToAdd]);
	};

	const handleSearch = async (query) => {
		setSearch(query);
		if (!query) {
			return;
		}

		try {
			setloading(true);
			const config = {
				headers: {
					Authorization: `Bearer ${User.token}`,
				},
			};
			const { data } = await axios.get(
				`http://localhost:5000/user?search=${Search}`,
				config
			);
			console.log(data);
			setloading(false);
			setSearchResult(data);
		} catch (error) {
			toast({
				title: "Error Occured!",
				description: "Failed to Load the Search Results",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
		}
	};

	const handleDelete = (delUser) => {
		if (delUser === User) {
			toast({
				title: "Error Occured!",
				description: "Cannot Remove yourself",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
			return;
		}

		setSelectedUsers(SelectedUsers.filter((sel) => sel._id !== delUser._id));
	};

	const handleSubmit = async () => {
		if (!groupChatName || !SelectedUsers) {
			toast({
				title: "Please fill all the feilds",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		if (SelectedUsers.length <= 2) {
			toast({
				title: "Need at least 3 people to make a group chat",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			return;
		}
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${User.token}`,
				},
			};
			const { data } = await axios.post(
				`http://localhost:5000/chats/creategroup`,
				{
					name: groupChatName,
					users: JSON.stringify(SelectedUsers.map((u) => u._id)),
				},
				config
			);
			setChats([data, ...Chats]);
			onClose();
			toast({
				title: "New Group Chat Created!",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		} catch (error) {
			if (error.response) {
				toast({
					title: "Failed to Create the Chat!",
					description: error.response.data,
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				});
			}
			console.log(error);
		}
	};

	return (
		<>
			<span onClick={onOpen}>{children}</span>

			<Modal onClose={onClose} isOpen={isOpen} isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader
						fontSize="35px"
						fontFamily="Work sans"
						d="flex"
						justifyContent="center"
					>
						Create Group Chat
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody d="flex" flexDir="column" alignItems="center">
						<FormControl>
							<Input
								placeholder="Chat Name"
								mb={3}
								onChange={(e) => setGroupChatName(e.target.value)}
							/>
						</FormControl>
						<FormControl>
							<Input
								placeholder="Add Users"
								mb={1}
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</FormControl>
						<Box w="100%" d="flex" flexWrap="wrap">
							{SelectedUsers.map((u) => (
								<UserBadgeItem
									key={u._id}
									user={u}
									handleFunction={() => handleDelete(u)}
								/>
							))}
						</Box>
						{loading ? (
							<div>Loading...</div>
						) : (
							SearchResult?.slice(0, 4).map((user) => (
								<UserListItem
									key={user._id}
									user={user}
									handleFunction={() => handleGroup(user)}
								/>
							))
						)}
					</ModalBody>
					<ModalFooter>
						<Button onClick={handleSubmit} colorScheme="blue">
							Create Chat
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default GroupChatModal;
