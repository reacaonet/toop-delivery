import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	InputProps,
	useColorModeValue
} from "@chakra-ui/react";
import { forwardRef, ForwardRefRenderFunction } from "react";
import { FieldError } from "react-hook-form";

interface FormInputProps extends InputProps {
	label?: string;
	name: string;
	error?: FieldError;
}

const FormInputBase: ForwardRefRenderFunction<
	HTMLInputElement,
	FormInputProps
> = ({ name, error = null, label, ...rest }, ref): JSX.Element => {
	const bg = useColorModeValue("gray.100", "gray.900");

	return (
		<FormControl isInvalid={!!error}>
			{!!label && <FormLabel htmlFor={name}>{label}</FormLabel>}
			<Input
				_hover={{
					bg
				}}
				_focus={{
					bg,
					borderColor: "primary.500"
				}}
				bg={bg}
				name={name}
				id={name}
				ref={ref}
				size="lg"
				variant="filled"
				{...rest}
			/>

			{!!error && <FormErrorMessage>{error.message}</FormErrorMessage>}
		</FormControl>
	);
};

export const FormInput = forwardRef(FormInputBase);
