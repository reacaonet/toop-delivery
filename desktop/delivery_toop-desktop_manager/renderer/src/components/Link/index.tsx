import {
	Icon as ChakraIcon,
	Link as ChakraLink,
	LinkProps as ChakraLinkProps,
	useColorModeValue
} from "@chakra-ui/react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { IconType } from "react-icons";
import { RiArrowDropDownLine, RiExternalLinkLine } from "react-icons/ri";

interface LinkProps extends NextLinkProps {
	chakraLinkProps?: ChakraLinkProps;
	hasDropdown?: boolean;
	icon?: IconType;
	isActive?: boolean;
	isExternal?: boolean;
	label: string;
}

export function Link({
	chakraLinkProps,
	hasDropdown = false,
	icon: Icon,
	isActive = false,
	isExternal = false,
	label,
	...rest
}: LinkProps): JSX.Element {
	const activeColor = useColorModeValue("black", "white");

	const color = useColorModeValue("gray.600", "gray.200");

	return (
		<NextLink passHref {...rest}>
			<ChakraLink
				_hover={{
					color: activeColor,
					textDecoration: "none"
				}}
				alignItems={"center"}
				color={isActive ? activeColor : color}
				flexDirection={"row"}
				fontWeight={"bold"}
				justifyContent={"center"}
				target={isExternal ? "_blank" : "_self"}
				{...chakraLinkProps}
			>
				{Icon && <ChakraIcon as={Icon} marginRight={"1"} />}
				{label}
				{isExternal && <ChakraIcon as={RiExternalLinkLine} />}
				{hasDropdown && (
					<ChakraIcon
						as={RiArrowDropDownLine}
						transition={"all .25s ease-in-out"}
						w={6}
						h={6}
					/>
				)}
			</ChakraLink>
		</NextLink>
	);
}
