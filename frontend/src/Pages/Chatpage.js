import { Box } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import ChatBox from "../components/ChatBox";
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";

const Chatpage = () => {
	const { User } = ChatState();
  const toast  = useToast();
	const history = useHistory();

	const authcheck = useCallback(async () => {
		try {
			const token = JSON.parse(localStorage.getItem("UserInfo") || "{}").token;
      if (!token) {
        history.push("/");
        return;
      }

			const config = {
				headers: { Authorization: `Bearer ${token}` },
			};

			const { data } = await axios.get(
				"http://localhost:5000/user/auth",
				config
			);
      console.log(data);

			if (data.message !== "Token is valid") {
				localStorage.removeItem("UserInfo");
				history.push("/");
			}
		} catch (error) {
			toast({
				title: "Error Occurred!",
				description: "Failed to authenticate the user",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
			console.error(error);
			localStorage.removeItem("UserInfo");
			history.push("/");
		}
	}, [history, toast]);

	useEffect(() => {
		authcheck();
	}, [authcheck]);

	const [FetchAgain, setFetchAgain] = useState(false);
	return (
		<div style={{ width: "100%" }}>
			{User && <SideDrawer />}
			<Box
				display="flex"
				justifyContent="space-between"
				w="100%"
				h="91.5vh"
				p="10px"
			>
				{User && <MyChats fetchAgain={FetchAgain} />}
				{User && (
					<ChatBox fetchAgain={FetchAgain} setfetchAgain={setFetchAgain} />
				)}
			</Box>
		</div>
	);
};

export default Chatpage;
