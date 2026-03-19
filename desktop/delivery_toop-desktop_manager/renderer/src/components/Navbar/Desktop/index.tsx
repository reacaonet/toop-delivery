import { Divider, Flex, Stack } from '@chakra-ui/react';
import { Fragment } from 'react';

import { DesktopUserMenu } from '../../../components/UserMenu/Desktop';
import { NavItem } from '../../../types/navbar';
import { DesktopNavItem } from './Item';

interface DesktopNavProps {
  items: Array<NavItem>;
}

export function DesktopNav({ items }: DesktopNavProps): JSX.Element {
  return (
    <Flex
      alignItems={'center'}
      height={'100%'}
      justifyContent={'space-between'}
      marginRight={'2.5'}
      width={'100%'}>
      <Stack alignItems={'center'} direction={'row'} spacing={2.5}>
        {items.map((navItem, idx) => (
          <Fragment key={navItem.label}>
            {idx !== 0 && (
              <Divider
                borderColor={'gray'}
                orientation={'vertical'}
                height={'5'}
              />
            )}
            <DesktopNavItem key={navItem.label} {...navItem} />
          </Fragment>
        ))}
      </Stack>

      <Stack alignItems={'center'} direction={'row'} spacing={2.5}>
        <DesktopUserMenu />
      </Stack>
    </Flex>
  );
}
