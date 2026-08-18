import {
  Collapse,
  Flex,
  HStack,
  Icon,
  Link as ChakraLink,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import {
  RiArrowDropDownLine,
  RiLoginCircleLine,
  RiLogoutCircleLine,
  RiUserAddLine,
} from 'react-icons/ri';

import { Link } from '../../components/Link';
import { useAuth } from '../../contexts/Auth';
import { NavMenuMobileItem } from './MobileItem';

interface MobileUserMenuProps {
  onToggleUp: () => void;
}

export function MobileUserMenu({
  onToggleUp,
}: MobileUserMenuProps): JSX.Element {
  const { isOpen, onToggle } = useDisclosure();
  const { user, signOut, isAuthenticated } = useAuth();

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const color = useColorModeValue('gray.600', 'gray.200');

  if (!isAuthenticated) {
    return (
      <HStack alignItems={'center'} onClick={onToggleUp}>
        <Link
          chakraLinkProps={{
            textAlign: 'center',
            width: 'full',
          }}
          href={'/login'}
          icon={RiLoginCircleLine}
          label={'Entrar'}
        />
        <Link
          chakraLinkProps={{
            textAlign: 'center',
            width: 'full',
          }}
          href={'/register'}
          icon={RiUserAddLine}
          label={'Cadastrar'}
        />
      </HStack>
    );
  }

  return (
    <Stack spacing={4} onClick={onToggle}>
      <Flex
        py={2}
        as={ChakraLink}
        href={'#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}>
        <Text fontWeight={'normal'} color={color}>
          {user?.name ?? ''}
        </Text>
        <Icon
          as={RiArrowDropDownLine}
          transition={'all .25s ease-in-out'}
          transform={isOpen ? 'rotate(180deg)' : ''}
          w={6}
          h={6}
        />
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={borderColor}
          align={'start'}>
          <NavMenuMobileItem
            icon={RiLogoutCircleLine}
            label={'Sair'}
            onClick={signOut}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
}
