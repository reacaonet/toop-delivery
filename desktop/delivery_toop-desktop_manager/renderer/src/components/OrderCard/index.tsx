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
import React, { useState } from "react";
import { useEffect } from "react";

import { SanitizedOrderForCard } from "../../@types/dashboard";
import { setupApiClient } from "../../services/api";
import { database } from "../../services/firebase";
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
	const [FBMessage, setFBMessage] = useState("");
	const [hasNewMessage, setHasNewMessage] = useState(false);
	const [cartId] = useState(order?.cartId);
	const activeBgColor = useColorModeValue("primary.200", "primary.900");
	const bgColor = useColorModeValue("gray.200", "gray.900");
	const bgColorHover = useColorModeValue("blackAlpha.200", "whiteAlpha.200");

	useEffect(() => {
		(async () => {
			if (order?.status !== "CANCELED" && order?.status !== "FINISHED") {
				await getMessages().then((res) => {
					if (res[res.length - 1]?.person === "customer") {
						setHasNewMessage(true);
						new Audio("/notification.mp3").play();
					} else {
						setHasNewMessage(false);
					}
				});
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [FBMessage]);

	useEffect(() => {
		const chatRef = database.ref(`chat/cart/${cartId}`);
		chatRef.once("value", async (val) => {
			if (val.exists()) {
				const { message } = val.val();
				setFBMessage(message);
			}
		});

		chatRef.on("child_changed", async (val) => {
			const message = val.val();

			if (val.key === "message") {
				setFBMessage(message);
			}
		});

		return () => chatRef.off();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cartId]);

	async function getMessages(): Promise<any> {
		const api = setupApiClient();

		const { data } = await api.get(`/v1/front/chat/${cartId}`);

		return data;
	}

	const elapsedTime = new Date(order?.createdAt);

	const badgeColor = {
		ACCEPT_DELIVERYMAN: "orange",
		CANCELED: "red",
		DELIVERY_ROUTE: "orange",
		FINISHED: "green",
		IN_PREPARATION: "orange",
		RELEASE_SHOPPER: "orange",
		WAIT_COMPANY: "blue",
		WAIT_DELIVERYMAN: "blue"
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
			{hasNewMessage &&
				order?.status !== "FINISHED" &&
				order?.status !== "DELIVERY_ROUTE" &&
				order?.status !== "CANCELED" && (
					<Badge
						backgroundColor="green.600"
						height={4}
						width={4}
						position="absolute"
						top={2}
						right={2}
					/>
				)}
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
