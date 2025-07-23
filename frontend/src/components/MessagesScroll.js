import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
	isSameSender,
	isUserMessage,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ Messages, isGroupChat }) => {
	const { User } = ChatState();

	return (
		<>
			{isGroupChat ? (
				<ScrollableFeed>
					{Messages &&
						Messages.map((m, i) => (
							<div style={{ display: "flex" }} key={m._id}>
								{!isSameSender(Messages, m, i) &&
									!isUserMessage(Messages, m, i, User._id) && (
										<Tooltip
											label={m.sender.name}
											placement="bottom-start"
											hasArrow
										>
											<Avatar
												mt="7px"
												mr={1}
												size="sm"
												cursor="pointer"
												name={m.sender.name}
												src={m.sender.pic}
											/>
										</Tooltip>
									)}
								<span
									style={{
										backgroundColor: isUserMessage(Messages, m, i, User._id)
											? "#BEE3F8"
											: "#B9F5D0",
										marginLeft: isUserMessage(Messages, m, i, User._id)
											? "auto"
											: 0,
										marginTop: isSameSender(Messages, m, i) ? 3 : 10,
										borderRadius: "20px",
										padding: "5px 15px",
										maxWidth: "75%",
									}}
								>
									{m.content}
								</span>
							</div>
						))}
				</ScrollableFeed>
			) : (
				<ScrollableFeed>
					{Messages &&
						Messages.map((m, i) => (
							<div style={{ display: "flex" }} key={m._id}>
								<span
									style={{
										backgroundColor: isUserMessage(Messages, m, i, User._id)
											? "#BEE3F8"
											: "#B9F5D0",
										marginLeft: isUserMessage(Messages, m, i, User._id)
											? "auto"
											: 0,
										marginTop: isSameSender(Messages, m, i) ? 3 : 10,
										borderRadius: "20px",
										padding: "5px 15px",
										maxWidth: "75%",
									}}
								>
									{m.content}
								</span>
							</div>
						))}
				</ScrollableFeed>
			)}
		</>
	);
};

export default ScrollableChat;
