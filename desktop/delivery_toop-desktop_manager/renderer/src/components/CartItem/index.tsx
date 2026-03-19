import {
	Flex,
	Heading,
	Img,
	Stack,
	Text,
	useColorModeValue
} from "@chakra-ui/react";
import React from "react";

import { Cart } from "../../@types/cart";

interface ComponentProps {
	item: Cart;
}

export function CartItem({ item }: ComponentProps): JSX.Element {
	const itemBoxBackgroundColor = useColorModeValue("gray.200", "gray.900");

	return (
		<Flex
			alignItems="center"
			backgroundColor={itemBoxBackgroundColor}
			borderRadius="xl"
			flexDirection="row"
			key={item?._id}
			minHeight="40"
			padding="2"
			width="full"
		>
			<Img
				alignSelf="flex-start"
				borderRadius={6}
				src={item?.foodProduct.images[0]}
				maxHeight="36"
				width="36"
			/>
			<Flex
				alignSelf="flex-start"
				flexDirection="column"
				padding="3"
				width="full"
			>
				<Flex width="full">
					<Heading fontSize="xl">{item?.foodProduct.name}</Heading>
					<Text fontSize="md" lineHeight="shorter" marginLeft="1.5">
						x{item?.amount}
					</Text>
				</Flex>
				<Stack marginTop="1.5" spacing="0.5">
					<Flex alignItems="flex-end" flexDirection="row">
						<Heading fontSize="md" fontWeight="bold">
							Subtotal:
						</Heading>
						<Text fontSize="sm" lineHeight="shorter" marginLeft="1">
							{new Intl.NumberFormat("pt-BR", {
								currency: "BRL",
								minimumFractionDigits: 2,
								style: "currency"
							}).format(item?.amount * item.price)}
						</Text>
					</Flex>
					<Flex alignItems="flex-end" flexDirection="row">
						<Heading fontSize="md" fontWeight="bold">
							Comentário:
						</Heading>
						<Text fontSize="sm" lineHeight="shorter" marginLeft="1">
							{item?.comment ? item?.comment : "Sem comentário"}
						</Text>
					</Flex>
					<Flex alignItems="flex-start" flexDirection="column">
						<Heading fontSize="md" fontWeight="bold">
							Complementos/Adicionais:
						</Heading>
						{item?.complements?.map((comp) => (
							<Flex alignItems="flex-end" flexDirection="row" key={comp?._id}>
								<Heading fontSize="md" fontWeight="bold">
									{comp?.foodProductComplement?.name}:
								</Heading>
								<Text fontSize="sm" lineHeight="shorter" marginLeft="1">
									{comp?.name}
								</Text>
							</Flex>
						))}
					</Flex>
				</Stack>
			</Flex>
		</Flex>
	);
}
