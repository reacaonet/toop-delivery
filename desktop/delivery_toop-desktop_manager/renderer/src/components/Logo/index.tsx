import { Img } from '@chakra-ui/react';
import NextLink from 'next/link';

export function Logo(): JSX.Element {
  return (
    <NextLink href="/" passHref>
      <Img cursor="pointer" src="/images/logo.png" height="20" />
    </NextLink>
  );
}
