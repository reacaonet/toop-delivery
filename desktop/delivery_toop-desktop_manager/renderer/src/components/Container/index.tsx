import { Flex, FlexProps } from "@chakra-ui/react";
import React, { ReactNode } from "react";

interface ContainerProps extends FlexProps {
	children: ReactNode;
	upperContainerProps?: FlexProps;
}

export function Container({
	children,
	upperContainerProps,
	...rest
}: ContainerProps): JSX.Element {
	return (
		<Flex
			alignItems={"center"}
			flexDirection={"column"}
			flexGrow={1}
			justifyContent={"center"}
			{...upperContainerProps}
		>
			<Flex
				flexGrow={1}
				flexDirection="column"
				paddingX={["1.5", "3", "6", "12"]}
				paddingY={["1", "2", "4", "8"]}
				{...rest}
			>
				{children}
			</Flex>
		</Flex>
	);
}
