import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/layout";
import ProfileModal from "../miscellaneous/ProfileModal";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
		<Badge
			px={4}
			py={1}
			borderRadius="lg"
			m={1}
			mb={2}
			variant="solid"
			fontSize={12}
			colorScheme="purple"
			cursor="pointer"
		>
			<ProfileModal user={user}>
				<span>
					{user.name}
					{admin.map((admin) => {
						if (admin._id === user._id) {
							return <span key={admin._id}>(Admin)</span>;
						}
					})}
				</span>
			</ProfileModal>
			<CloseIcon pl={1} ml={2} onClick={handleFunction} />
		</Badge>
	);
};

export default UserBadgeItem;
