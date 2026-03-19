import {
	Box,
	Flex,
	Icon as ChakraIcon,
	Link,
	Stack,
	Text,
	useColorModeValue
} from "@chakra-ui/react";
import { IconType } from "react-icons";

interface NavMenuMobileItem {
	label: string;
	onClick: () => void;
	icon?: IconType;
}

export function NavMenuMobileItem({
	label,
	onClick,
	icon: Icon
}: NavMenuMobileItem): JSX.Element {
	return (
		<Link
			role={"group"}
			display={"block"}
			p={2}
			rounded={"md"}
			_hover={{ bg: useColorModeValue("primary.50", "gray.900") }}
			onClick={() => onClick()}
			width={"full"}
		>
			<Stack direction={"row"} align={"center"}>
				<Box>
					<Text
						transition={"all .3s ease"}
						_groupHover={{ color: "primary.400" }}
						fontWeight={"semibold"}
					>
						{label}
					</Text>
				</Box>
				{Icon && (
					<Flex
						transition={"all .3s ease"}
						justify={"flex-end"}
						align={"center"}
						flex={1}
					>
						<ChakraIcon as={Icon} color={"primary.400"} w={5} h={5} />
					</Flex>
				)}
			</Stack>
		</Link>
	);
}
