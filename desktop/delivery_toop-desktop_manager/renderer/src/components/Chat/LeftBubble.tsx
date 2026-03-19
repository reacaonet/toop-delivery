import { Box, Heading, useColorModeValue } from "@chakra-ui/react";

import { Message } from "../../@types/message";

interface LeftBubbleProps extends Message {
	customerName: string;
}

export function LeftBubble({
	message,
	customerName
}: LeftBubbleProps): JSX.Element {
	const bg = useColorModeValue("gray.300", "gray.800");

	return (
		<>
			<Heading alignSelf="flex-start" fontSize="xs" paddingLeft={2.5}>
				{customerName}
			</Heading>
			<Box
				alignSelf="flex-start"
				backgroundColor={bg}
				lineHeight="shorter"
				maxWidth="80%"
				paddingY={0.5}
				paddingX={2}
				rounded="xl"
				width="fit-content"
			>
				{message}
			</Box>
		</>
	);
}
