import {
	Badge,
	Box,
	Heading,
	Text,
	useColorModeValue,
	VStack
} from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";

import { SanitizedOrderForCard } from "../../@types/dashboard";
import { humanReadableStatus } from "../../utils/orderStatuses";

interface OrderCardProps {
	isActive?: boolean;
	onClick: (id: string) => void;
	order: SanitizedOrderForCard;
}

export function OrderCard({
	isActive = false,
	onClick,
	order
}: OrderCardProps): JSX.Element {
	const activeBgColor = useColorModeValue("primary.200", "primary.900");
	const bgColor = useColorModeValue("gray.200", "gray.900");
	const bgColorHover = useColorModeValue("blackAlpha.200", "whiteAlpha.200");

	const elapsedTime = new Date(order?.createdAt);

	const badgeColor: Record<string, string> = {
		pending: "blue",
		confirmed: "blue",
		preparing: "orange",
		ready: "orange",
		delivering: "orange",
		delivered: "green",
		cancelled: "red",
	};

	return (
		<Box
			_hover={{
				backgroundColor: isActive ? activeBgColor : bgColorHover
			}}
			alignItems="flex-start"
			backgroundColor={isActive ? activeBgColor : bgColor}
			borderRadius="xl"
			cursor={isActive ? "default" : "pointer"}
			height="32"
			onClick={() => onClick(order?.id)}
			padding="3"
			position="relative"
			transition="background 0.3s ease-in-out"
			minWidth="60"
			maxWidth="60"
		>
			<Heading fontSize={["md", "lg"]}>{order?.customerName}</Heading>
			<VStack
				alignItems="flex-start"
				bottom={3}
				position="absolute"
				spacing={2}
			>
				<Badge colorScheme={badgeColor[order?.status] ?? "gray"}>
					{humanReadableStatus[order?.status] ?? "DESCONHECIDO"}
				</Badge>
				<Text fontSize="smaller">
					{formatDistanceToNow(elapsedTime, {
						includeSeconds: true,
						addSuffix: true,
						locale: ptBR
					})}
				</Text>
			</VStack>
		</Box>
	);
}
