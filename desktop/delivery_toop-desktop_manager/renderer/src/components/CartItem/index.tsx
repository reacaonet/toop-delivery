import {
	Flex,
	Heading,
	Stack,
	Text
} from "@chakra-ui/react";
import React from "react";

interface OrderItem {
	name: string;
	quantity: number;
	price: number;
	total: number;
}

interface ComponentProps {
	items: OrderItem[];
}

export function CartItem({ items }: ComponentProps): JSX.Element {
	return (
		<Stack spacing={2} width="full">
			{items?.map((item, idx) => (
				<Flex
					alignItems="center"
					backgroundColor="gray.200"
					_dark={{ backgroundColor: "gray.900" }}
					borderRadius="xl"
					flexDirection="row"
					key={idx}
					minHeight="16"
					padding="3"
					width="full"
				>
					<Flex
						flexDirection="column"
						padding="1"
						width="full"
					>
						<Flex width="full" alignItems="center">
							<Heading fontSize="lg">{item?.name}</Heading>
							<Text fontSize="md" lineHeight="shorter" marginLeft="1.5">
								x{item?.quantity}
							</Text>
							<Text fontSize="sm" marginLeft="auto">
								{new Intl.NumberFormat("pt-BR", {
									currency: "BRL",
									minimumFractionDigits: 2,
									style: "currency"
								}).format(item?.total || item?.price * item?.quantity)}
							</Text>
						</Flex>
						<Flex alignItems="flex-end" flexDirection="row" marginTop="1">
							<Heading fontSize="sm" fontWeight="bold">
								Preço unit.:
							</Heading>
							<Text fontSize="sm" lineHeight="shorter" marginLeft="1">
								{new Intl.NumberFormat("pt-BR", {
									currency: "BRL",
									minimumFractionDigits: 2,
									style: "currency"
								}).format(item?.price)}
							</Text>
						</Flex>
					</Flex>
				</Flex>
			))}
		</Stack>
	);
}
