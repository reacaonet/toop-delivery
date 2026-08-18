import {
  Avatar,
  Heading,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import { RiArrowDropDownLine } from 'react-icons/ri';

import { useAuth } from '../../contexts/Auth';

export function DesktopUserMenu(): JSX.Element {
  const { isAuthenticated, user, signOut } = useAuth();

  const backgroundColor = useColorModeValue('white', 'gray.800');

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Menu>
      <MenuButton flexDirection="row">
        <HStack>
          <Avatar name={user?.name} size="md" />
          <Heading color="white" fontSize="md">
            {user?.name}
            <Icon as={RiArrowDropDownLine} />
          </Heading>
        </HStack>
      </MenuButton>

      <MenuList backgroundColor={backgroundColor}>
        <MenuItem onClick={signOut}>Sair</MenuItem>
      </MenuList>
    </Menu>
  );
}
