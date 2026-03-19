/* eslint-disable prettier/prettier */
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Flex,
  Spinner,
  Stack
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import Store from "electron-store";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { SubmitHandler, useForm, useFormState } from "react-hook-form";
import * as yup from "yup";

import { FormInput } from "../components/Input";
import { useAuth } from "../contexts/Auth";

interface SignInFormData {
  email: string;
  password: string;
}

const signInFormSchema = yup.object().shape({
  email: yup
    .string()
    .required("O campo de email é obrigatório")
    .email("Este campo precisa ser um email válido."),
  password: yup.string().required("O campo de senha é obrigatório")
});

export default function SignIn(): JSX.Element {
  const { control, formState, handleSubmit, register } =
    useForm<SignInFormData>({
      resolver: yupResolver(signInFormSchema)
    });
  const { errors } = useFormState({ control });
  const {
    credentialError, messageErr, setCredentialError, signIn, isAuthenticated
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === true) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSignIn: SubmitHandler<SignInFormData> = async ({
    email,
    password
  }) => {
    await signIn({ email, password });
  };

  const store = new Store();

  if (store.get("toop.user.id")) {
    return (
      <Flex
        alignItems={"center"}
        flexDirection={"column"}
        flexGrow={1}
        justifyContent={"center"}
      >
        <Head>
          <title>Entrar — Toop</title>
        </Head>

        <Spinner colorScheme="primary" size="xl" />
      </Flex>
    );
  }

  return (
    <Flex
      alignItems={"center"}
      flexDirection={"column"}
      flexGrow={1}
      justifyContent={"center"}
    >
      <Head>
        <title>Entrar — Toop</title>
      </Head>

      <Flex
        as="form"
        flexDirection="column"
        onSubmit={handleSubmit(handleSignIn)}
        width={["auto", "auto", "96"]}
      >
        <Stack spacing="6">
          {credentialError && (
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle mr={2}>Credenciais inválidas!</AlertTitle>
                <AlertDescription>
                  {messageErr ? messageErr : 'Verifique se você digitou corretamente seu email e senha.'}
                </AlertDescription>
              </Box>
              <CloseButton
                onClick={() => setCredentialError(false)}
                position="absolute"
                right="8px"
                top="8px"
              />
            </Alert>
          )}

          <FormInput
            error={errors.email}
            label="Email"
            type="email"
            {...register("email")}
          />
          <FormInput
            error={errors.password}
            label="Senha"
            type="password"
            {...register("password")}
          />
          <Button
            disabled={formState.isSubmitting}
            type="submit"
            colorScheme="primary"
            size="lg"
            fontSize="md"
          >
            Entrar
          </Button>
        </Stack>
      </Flex>
    </Flex>
  );
}
