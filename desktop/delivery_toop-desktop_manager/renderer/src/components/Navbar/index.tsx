import {
  Box,
  Collapse,
  Flex,
  Icon,
  IconButton,
  Stack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { GiHamburgerMenu, GiMoon, GiSun } from 'react-icons/gi';
import { RiCloseLine } from 'react-icons/ri';

import { Logo } from '../../components/Logo';
import { useAuth } from '../../contexts/Auth';
import { NavItem } from '../../types/navbar';
import { DesktopNav } from './Desktop';
import { MobileNav } from './Mobile';

export function WithSubnavigation(): JSX.Element {
  const { signOut } = useAuth();

  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box>
      <Flex
        alignItems={'center'}
        backgroundColor="primary.900"
        borderBottom={1}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        borderStyle={'solid'}
        color={useColorModeValue('gray.600', 'white')}
        minHeight={'60px'}
        paddingY={{ base: 2 }}
        paddingX={{ base: 4 }}>
        <Flex
          display={{ base: 'flex', md: 'none' }}
          flex={{ base: 1, md: 'auto' }}>
          <IconButton
            aria-label={'Toggle Navigation'}
            icon={
              isOpen ? (
                <Icon as={RiCloseLine} w={5} h={5} />
              ) : (
                <Icon as={GiHamburgerMenu} w={5} h={5} />
              )
            }
            onClick={onToggle}
            variant={'ghost'}
          />
        </Flex>

        <Flex
          flex={{ base: 1 }}
          justifyContent={{ base: 'center', md: 'start' }}>
          <Logo />

          <Flex
            alignItems="center"
            display={{ base: 'none', md: 'flex' }}
            marginLeft={10}
            width={'100%'}>
            <DesktopNav items={NAV_ITEMS} />
          </Flex>

          <Flex
            alignItems="center"
            justifyContent={'end'}
            display={{ base: 'none', md: 'flex' }}
            marginLeft={10}
            width={'30%'}>
            <button style={{ cursor: 'pointer' }} onClick={signOut}>
              Limpar Sessão
            </button>
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          flexDirection={'row'}
          justifyContent={'flex-end'}
          spacing={6}>
          <IconButton
            _hover={{
              backgroundColor: 'transparent',
            }}
            role="group"
            aria-label="Toggle Theme"
            icon={
              colorMode === 'light' ? (
                <Icon
                  _groupHover={{
                    color: 'white',
                  }}
                  as={GiSun}
                  color="gray.300"
                  h={5}
                  w={5}
                />
              ) : (
                <Icon
                  _groupHover={{
                    color: 'white',
                  }}
                  as={GiMoon}
                  color="gray.300"
                  h={5}
                  w={5}
                />
              )
            }
            onClick={toggleColorMode}
            variant={'ghost'}
          />
        </Stack>
      </Flex>

      <Collapse animateOpacity in={isOpen}>
        <MobileNav items={NAV_ITEMS} onToggle={onToggle} />
      </Collapse>
    </Box>
  );
}

const NAV_ITEMS: Array<NavItem> = [
  /* {
    label: "Inicio",
    href: "/dashboard"
  },
  {
    label: "Sobre",
    href: "/about"
  } */
];
