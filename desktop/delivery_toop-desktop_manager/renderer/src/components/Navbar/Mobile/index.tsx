import { Stack, useColorModeValue } from "@chakra-ui/react";

import { MobileUserMenu } from "../../../components/UserMenu/Mobile";
import { NavItem } from "../../../types/navbar";
import { MobileNavItem } from "./Item";

interface MobileNavProps {
	items: Array<NavItem>;
	onToggle: () => void;
}

export function MobileNav({ items, onToggle }: MobileNavProps): JSX.Element {
	return (
		<Stack
			bg={useColorModeValue("gray.50", "gray.900")}
			p={4}
			display={{ md: "none" }}
		>
			{items.map((navItem) => (
				<MobileNavItem onToggle={onToggle} key={navItem.label} {...navItem} />
			))}

			<MobileUserMenu onToggleUp={onToggle} />
		</Stack>
	);
}
