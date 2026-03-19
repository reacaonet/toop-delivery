import {
	Collapse,
	Stack,
	useColorModeValue,
	useDisclosure
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Link } from "../../../components/Link";
import { NavItem } from "../../../types/navbar";

export function MobileNavItem({
	label,
	children,
	href,
	onToggle: onToggleUp
}: NavItem): JSX.Element {
	const { isOpen, onToggle } = useDisclosure();
	const { asPath } = useRouter();
	const [isActive, setIsActive] = useState(false);

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

	return (
		<Stack spacing={0} onClick={children && onToggle}>
			<Link
				chakraLinkProps={{
					onClick: !children && onToggleUp ? () => onToggleUp() : () => null,
					padding: 2
				}}
				hasDropdown={!!children}
				href={href ?? "#"}
				isActive={isActive}
				label={label}
			/>

			<Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
				<Stack
					alignItems={"start"}
					borderColor={useColorModeValue("gray.200", "gray.700")}
					borderLeft={1}
					borderStyle={"solid"}
					marginTop={1.5}
					onClick={onToggleUp}
					paddingLeft={4}
				>
					{children &&
						children.map((child) => {
							const isChildActive =
								asPath === child.href || asPath === `${child.href}#`;

							return (
								<Link
									chakraLinkProps={{
										paddingY: 2,
										width: "full"
									}}
									href={child.href ?? "#"}
									icon={child.icon}
									isActive={isChildActive}
									key={child.label}
									label={child.label}
								/>
							);
						})}
				</Stack>
			</Collapse>
		</Stack>
	);
}
