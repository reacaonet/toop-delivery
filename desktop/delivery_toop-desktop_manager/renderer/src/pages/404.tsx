import { Flex, Heading, Icon, Text } from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { GiFoodTruck } from "react-icons/gi";

import { Link } from "../components/Link";
import { useAuth } from "../contexts/Auth";

export default function SignIn(): JSX.Element {
	const { isAuthenticated } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated === false) {
			router.push("/home");
		}
	}, [isAuthenticated, router]);

	return (
		<Flex
			alignItems={"center"}
			flexDirection={"column"}
			flexGrow={1}
			justifyContent={"center"}
		>
			<Head>
				<title>Não Encontrado — Toop</title>
			</Head>

			<Flex flexDirection="column">
				<Icon as={GiFoodTruck} height={24} width={24} />
				<Heading>oops... alguém se perdeu no caminho...</Heading>
				<Text>
					Você não deveria estar aqui... Talvez seja uma falha minha, talvez
					não, mas por enquanto volte para a{" "}
					<Link href={"/dashboard"} label={"página inicial"} />
				</Text>
			</Flex>
		</Flex>
	);
}
