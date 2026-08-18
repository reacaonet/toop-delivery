import { Flex, Heading, Stack, Text } from "@chakra-ui/react";
import React from "react";

interface DeliveryAddress {
	street?: string;
	number?: string;
	complement?: string;
	neighborhood?: string;
	city?: string;
	state?: string;
	zipCode?: string;
};

interface OrderDeliveryProps {
	deliveryAddress?: DeliveryAddress;
}
export function OrderDeliveryAddress({
	deliveryAddress
}: OrderDeliveryProps): JSX.Element {
	const fullAddress = deliveryAddress
		? [deliveryAddress.street, deliveryAddress.number, deliveryAddress.neighborhood, deliveryAddress.city, deliveryAddress.state].filter(Boolean).join(', ')
		: null;

	return (
		<Stack marginTop="2" spacing="1.5">
			<Flex alignItems="flex-end" flexDirection="row">
				<Heading fontSize="lg" fontWeight="semibold">
					Endereço:
				</Heading>
				<Text fontSize="sm" lineHeight="shorter" marginLeft="1">
					{fullAddress || "Não informado"}
				</Text>
			</Flex>
			{deliveryAddress?.complement && (
				<Flex alignItems="flex-end" flexDirection="row">
					<Heading fontSize="lg" fontWeight="semibold">
						Complemento:
					</Heading>
					<Text fontSize="sm" lineHeight="shorter" marginLeft="1">
						{deliveryAddress.complement}
					</Text>
				</Flex>
			)}
			{deliveryAddress?.zipCode && (
				<Flex alignItems="flex-end" flexDirection="row">
					<Heading fontSize="lg" fontWeight="semibold">
						CEP:
					</Heading>
					<Text fontSize="sm" lineHeight="shorter" marginLeft="1">
						{deliveryAddress.zipCode}
					</Text>
				</Flex>
			)}
		</Stack>
	);
}
