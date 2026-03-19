import React from 'react';
import { View } from 'react-native';

import user from '../../../assets/images/user.png';
import creditCard from '../../../assets/images/creditCard.png';
import exit from '../../../assets/images/exit.png';
import fastFood from '../../../assets/images/fastFood.png';
import clientSupport from '../../../assets/images/clientSupport.png';
import apple from '../../../assets/images/apple.png';
import location from '../../../assets/images/location.png';
import home from '../../../assets/images/home.png';
import ticket from '../../../assets/images/ticket.png';
import market from '../../../assets/images/market.png';

import { Icon } from './styles';

interface IconProps {
  name:
    | 'user'
    | 'creditCard'
    | 'exit'
    | 'fastFood'
    | 'clientSupport'
    | 'apple'
    | 'location'
    | 'home'
    | 'ticket'
    | 'market';
}

const CustomIcon: React.FC<IconProps> = ({ name }) => {
  const iconDescriptors = {
    user,
    creditCard,
    exit,
    fastFood,
    clientSupport,
    apple,
    location,
    home,
    ticket,
    market,
  };

  return <Icon source={iconDescriptors[name]} />;
};

export default CustomIcon;
