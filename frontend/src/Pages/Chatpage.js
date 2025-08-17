import { Box } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import ChatBox from "../components/ChatBox";

import { useHistory } from "react-router-dom";
import { ChatState } from "../context/ChatProvider";


const Chatpage = () => {
	const [User, setUser] = ChatState();

	const history = useHistory();

	useEffect(() => {
		const userInfo = JSON.parse(localStorage.getItem("UserInfo"));
		setUser(userInfo);
		if (!userInfo) history.push("/");
	  }, [history]);

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
