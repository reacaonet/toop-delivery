import { Stack, Text, useColorModeValue } from "@chakra-ui/react";

import { Item } from "./Item";

interface PaginationProps {
	totalRegisterCount: number;
	registersPerPage?: number;
	currentPage?: number;
	onPageChange: (page: number) => void;
}
const siblingsCount = 1;

function generatePagesArray(from: number, to: number): number[] {
	return [...new Array(to - from)]
		.map((_, index) => {
			return from + index + 1;
		})
		.filter((page) => page > 0);
}

export function Pagination({
	totalRegisterCount,
	currentPage = 1,
	onPageChange,
	registersPerPage = 10
}: PaginationProps): JSX.Element {
	const color = useColorModeValue("gray.700", "gray.300");
	const lastPage = Math.ceil(totalRegisterCount / registersPerPage);

	const previousPages =
		currentPage > 1
			? generatePagesArray(currentPage - 1 - siblingsCount, currentPage - 1)
			: [];

	const nextPages =
		currentPage < lastPage
			? generatePagesArray(
					currentPage,
					Math.min(currentPage + siblingsCount, lastPage)
			  )
			: [];

	return (
		<Stack
			align={"center"}
			direction={["column", "row"]}
			justify={"space-between"}
			mt={"8"}
			spacing={"6"}
		>
			<Text>
				<strong>
					{totalRegisterCount > 0 ? (currentPage - 1) * 10 + 1 : 0}
				</strong>{" "}
				-{" "}
				<strong>
					{totalRegisterCount < 10 || currentPage * 10 > totalRegisterCount
						? totalRegisterCount
						: currentPage * 10}
				</strong>{" "}
				de <strong>{totalRegisterCount}</strong>
			</Text>
			<Stack direction={"row"} spacing={"2"}>
				{currentPage > 1 + siblingsCount && (
					<>
						<Item number={1} onPageChange={onPageChange} />
						{2 + siblingsCount < currentPage && (
							<Text color={color} textAlign={"center"} w={"8"}>
								...
							</Text>
						)}
					</>
				)}
				{previousPages.length > 0 &&
					previousPages.map((page) => (
						<Item key={page} number={page} onPageChange={onPageChange} />
					))}
				<Item number={currentPage} isCurrent onPageChange={onPageChange} />
				{nextPages.length > 0 &&
					nextPages.map((page) => (
						<Item key={page} number={page} onPageChange={onPageChange} />
					))}

				{currentPage + siblingsCount < lastPage && (
					<>
						{currentPage + 1 + siblingsCount < lastPage && (
							<Text color={color} textAlign={"center"} w={"8"}>
								...
							</Text>
						)}
						<Item number={lastPage} onPageChange={onPageChange} />
					</>
				)}
			</Stack>
		</Stack>
	);
}
