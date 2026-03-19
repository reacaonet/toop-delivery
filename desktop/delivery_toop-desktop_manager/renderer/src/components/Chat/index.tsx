import {
	Button,
	Heading,
	HStack,
	Icon,
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useColorModeValue,
	useDisclosure,
	VStack
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import {
	RiMessage2Fill,
	RiMessage2Line,
	RiMessageLine,
	RiSendPlaneLine
} from "react-icons/ri";

import { Message } from "../../@types/message";
import { useAuth } from "../../contexts/Auth";
import { setupApiClient } from "../../services/api";
import { database } from "../../services/firebase";
import { LeftBubble } from "./LeftBubble";
import { RightBubble } from "./RightBubble";

interface ChatProps {
	userId: number;
	cartId: string;
	customerName: string;
	customerId: string;
	orderNumber: number;
	shoppingCartId: string;
	companyName: string;
	enabled: boolean;
}

export function Chat({
	cartId,
	customerId,
	shoppingCartId,
	customerName,
	orderNumber,
	companyName,
	enabled
}: ChatProps): JSX.Element {
	const [messages, setMessages] = useState<Message[]>();
	const [newMessage, setNewMessage] = useState("");
	const [FBMessage, setFBMessage] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [buttonAlert, setButtonAlert] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { user } = useAuth();

	const scrollbarColor = useColorModeValue("#CBD5E0", "#C53030");
	const bg = useColorModeValue("gray.100", "gray.900");

	useEffect(() => {
		(async () => {
			await getMessages().then((res) => {
				setMessages(res);
				if (res[res.length - 1]?.person === "customer") {
					setButtonAlert(true);
				} else {
					setButtonAlert(false);
				}
				setIsSending(false);
			});
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

	async function sendMessage(
		e?: React.FormEvent<HTMLInputElement>
	): Promise<void> {
		e?.preventDefault();
		setIsSending(true);
		const api = setupApiClient();

		await api
			.post(`/v1/front/chat/`, {
				message: newMessage,
				type: "text",
				person: "shopper",
				personId: user?.id,
				personSend: "customer",
				personSendId: customerId,
				shoppingCart: shoppingCartId,
				read: false,
				readSend: true,
				order_number: orderNumber
			})
			.then(() => {
				getMessages().then((res) => setMessages(res));
				setNewMessage("");
			})
			.finally(() => setIsSending(false));
	}

	const AlwaysScrollToBottom = (): JSX.Element => {
		const elementRef = useRef(null);
		useEffect(() => elementRef?.current?.scrollIntoView());
		return <div ref={elementRef} />;
	};

	const onClick = (): void => {
		onOpen();
		setButtonAlert(false);
	};

	return (
		<>
			{enabled && (
				<Button
					colorScheme="whatsapp"
					leftIcon={
						buttonAlert ? (
							<Icon as={RiMessage2Fill} height={6} width={6} />
						) : (
							<Icon as={RiMessage2Line} height={6} width={6} />
						)
					}
					marginTop={3}
					onClick={onClick}
					width="100%"
				>
					Abrir Chat
				</Button>
			)}

			<Modal
				isCentered
				isOpen={isOpen}
				motionPreset="slideInBottom"
				onClose={onClose}
				scrollBehavior="inside"
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader fontWeight="normal" maxWidth="95%">
						Conversa com <b>{customerName}</b> sobre o pedido Nº{" "}
						<b>{orderNumber}</b>
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody
						css={{
							"&::-webkit-scrollbar": {
								width: "4px"
							},
							"&::-webkit-scrollbar-track": {
								backgroundColor: "transparent",
								borderRadius: "24px",
								width: "6px"
							},
							"&::-webkit-scrollbar-thumb": {
								background: scrollbarColor,
								borderRadius: "24px"
							}
						}}
						backgroundColor={useColorModeValue("gray.50", "gray.900")}
					>
						<VStack spacing={2.5} width="100%">
							{messages && messages.length > 0 ? (
								messages?.map((message) => {
									if (message.person === "shopper") {
										return (
											<RightBubble
												companyName={companyName}
												key={message.createdAt}
												{...message}
											/>
										);
									}

									return (
										<LeftBubble
											customerName={customerName}
											key={message.createdAt}
											{...message}
										/>
									);
								})
							) : (
								<VStack spacing={2.5}>
									<Icon as={RiMessageLine} height="10" width="10" />
									<Heading fontSize="lg">Não há mensagens</Heading>
								</VStack>
							)}
						</VStack>
						<AlwaysScrollToBottom />
					</ModalBody>
					<ModalFooter>
						<HStack as="form" onSubmit={sendMessage} spacing={2.5} width="100%">
							<Input
								_hover={{
									bg
								}}
								_focus={{
									bg,
									borderColor: "primary.500"
								}}
								bg={bg}
								disabled={isSending}
								onChange={(e) => setNewMessage(e.target.value)}
								value={newMessage}
								size="lg"
								variant="filled"
								width="100%"
								placeholder="Escreva algo..."
							/>
							<IconButton
								_hover={{
									backgroundColor: "primary.600"
								}}
								aria-label="Enviar Mensagem"
								color="white"
								disabled={isSending}
								backgroundColor="primary.500"
								icon={<Icon as={RiSendPlaneLine} />}
								type="submit"
								size="lg"
							/>
						</HStack>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}
