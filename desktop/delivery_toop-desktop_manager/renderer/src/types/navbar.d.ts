import { IconType } from "react-icons";

export interface NavItem {
	label: string;
	children?: Array<NavItem>;
	icon?: IconType;
	subLabel?: string;
	href?: string;
	onToggle?: () => void;
}
