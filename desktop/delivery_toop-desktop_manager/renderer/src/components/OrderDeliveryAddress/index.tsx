import { Flex, Heading, Stack, Text } from "@chakra-ui/react";
import React from "react";

import { Link } from "../Link";

interface OrderDeliveryProps {
	customerCoordinates: [number, number];
	companyCoordinates: [number, number];
	customerReferencePoint: string;
	customerAddress: string;
	customerComplement: string;
}
export function OrderDeliveryAddress({
	companyCoordinates,
	customerCoordinates,
	customerAddress,
	customerComplement,
	customerReferencePoint
}: OrderDeliveryProps): JSX.Element {
	return (
		<Stack marginTop="2" spacing="1.5">
			<Flex alignItems="flex-end" flexDirection="row">
				<Heading fontSize="lg" fontWeight="semibold">
					Rua:
				</Heading>
				<Text fontSize="sm" lineHeight="shorter" marginLeft="1">
					{customerAddress ? customerAddress : "Não informado"}
				</Text>
			</Flex>
			<Flex alignItems="flex-end" flexDirection="row">
				<Heading fontSize="lg" fontWeight="semibold">
					Complemento:
				</Heading>
				<Text fontSize="sm" lineHeight="shorter" marginLeft="1">
					{customerComplement ? customerComplement : "Não informado"}
				</Text>
			</Flex>
			<Flex alignItems="flex-end" flexDirection="row">
				<Heading fontSize="lg" fontWeight="semibold">
					Ponto de Referência:
				</Heading>
				<Text fontSize="sm" lineHeight="shorter" marginLeft="1">
					{customerReferencePoint ? customerReferencePoint : "Não informado"}
				</Text>
			</Flex>
			{companyCoordinates && customerCoordinates && (
				<Link
					isExternal
					href={`https://www.google.com/maps/dir/?api=1&origin=${companyCoordinates[1]},${companyCoordinates[0]}&destination=${customerCoordinates[1]},${customerCoordinates[0]}`}
					label="Abrir no Google Maps"
				/>
			)}
		</Stack>
	);
}
