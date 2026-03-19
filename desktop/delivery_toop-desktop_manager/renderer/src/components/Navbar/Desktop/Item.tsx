import {
	Heading,
	Icon,
	Link as ChakraLink,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	SimpleGrid,
	Stack,
	Text,
	useColorModeValue
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

import { Link } from "../../../components/Link";
import { NavItem } from "../../../types/navbar";

export function DesktopNavItem({
	label,
	children,
	href
}: NavItem): JSX.Element {
	const { asPath } = useRouter();
	const [isActive, setIsActive] = useState(false);

	const activeColor = useColorModeValue("black", "white");
	const color = useColorModeValue("gray.300", "gray.700");
	const menuListBg = useColorModeValue("whiteAlpha.500", "gray.800");
	const itemBg = useColorModeValue("gray.200", "gray.900");

	useEffect(() => {
		if (children) {
			setIsActive(
				!!children.find(
					(child) => asPath === child.href || asPath === `${child.href}#`
				)
			);
		} else {
			setIsActive(asPath === href || asPath === `${href}#`);
		}
	}, [asPath, children, href]);

	if (children) {
		return (
			<Menu autoSelect={false} closeOnSelect>
				<MenuButton
					_hover={{
						color: activeColor,
						textDecoration: "none"
					}}
					color={isActive ? activeColor : color}
					fontWeight={"bold"}
					flexDirection={"row"}
					paddingLeft={"1.5"}
				>
					{label}
					<Icon
						as={RiArrowDropDownLine}
						height={5}
						transition={"color .25s ease-in-out"}
						width={5}
					/>
				</MenuButton>

				<MenuList background={menuListBg} borderRadius={0} marginTop={3}>
					<Heading
						fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
						paddingX={3}
						paddingY={1}
					>
						{label}
					</Heading>
					<SimpleGrid
						columns={{ base: 1, lg: 3 }}
						gap={3}
						paddingX={2}
						width={"99vw"}
					>
						{children.map((child) => {
							const isActiveChild =
								asPath === child.href || asPath === `${child.href}#`;
							return (
								<MenuItem
									_hover={{
										backgroundColor: itemBg
									}}
									borderRadius={"md"}
									key={child.label}
									padding={0}
								>
									<NextLink passHref href={child.href ?? "#"}>
										<ChakraLink
											_hover={{
												color: activeColor,
												textDecoration: "none"
											}}
											alignItems={"center"}
											borderRadius={"md"}
											color={isActiveChild ? activeColor : color}
											fontWeight={"bold"}
											justifyContent={"center"}
											padding={2}
											width={"full"}
										>
											<Stack
												alignItems={"center"}
												direction={"row"}
												spacing={1}
											>
												{child.icon && (
													<Icon
														as={child.icon}
														fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
														marginRight={"1"}
													/>
												)}
												<Heading
													fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
													lineHeight={1.1}
												>
													{child.label}
												</Heading>
											</Stack>
											<Text>{child.subLabel}</Text>
										</ChakraLink>
									</NextLink>
								</MenuItem>
							);
						})}
					</SimpleGrid>
				</MenuList>
			</Menu>
		);
	}

	return (
		<Link
			chakraLinkProps={{
				paddingX: 1.5
			}}
			hasDropdown={!!children}
			href={href ?? "#"}
			isActive={isActive}
			label={label}
		/>
	);
}
