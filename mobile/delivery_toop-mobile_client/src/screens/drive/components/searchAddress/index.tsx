/* eslint-disable prettier/prettier */
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Container, Address } from './styles';
import { Colors } from '../../../../styles';

const SearchAddress = ({ navigation }: any) => {
  const {
    user: { user = null },
  }: any = useSelector(state => state);

  const { t } = useTranslation();

  return (
    <Container>
      <Icon name={'search'} size={25} />
      <Address
        placeholder={t('wereGoing')}
        placeholderTextColor={Colors.BLACK}
        onPressIn={() => {
          if (
            user &&
            user?.person?.email &&
            user?.person?.name &&
            user?.person?.phone
          ) {
            navigation.navigate('RideAndTravelStack', {
              screen: 'SelectDestiny',
              params: {},
            });
          } else {
            navigation.navigate('Register', {
              screen: 'Name',
              params: {},
            });
          }
        }}
      />
    </Container>
  );
};

export default SearchAddress;
