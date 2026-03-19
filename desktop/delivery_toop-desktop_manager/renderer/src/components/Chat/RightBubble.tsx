import { Box, Heading, useColorModeValue } from "@chakra-ui/react";

import { Message } from "../../@types/message";

interface RightBubbleProps extends Message {
	companyName: string;
}

export function RightBubble({
	message,
	companyName
}: RightBubbleProps): JSX.Element {
	const bg = useColorModeValue("primary.300", "primary.600");

	return (
		<>
			<Heading alignSelf="flex-end" fontSize="xs" paddingRight={2.5}>
				{companyName}
			</Heading>
			<Box
				alignSelf="flex-end"
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
