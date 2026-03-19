import React from 'react';

import {StyleProp, ViewStyle} from 'react-native';

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
import rela from '../../../assets/images/Relatorios35.png';
import pedidos from '../../../assets/images/Pedidos35.png';
import time from '../../../assets/images/Horarios35.png';
import entrega from '../../../assets/images/entrega.png';
import store from '../../../assets/images/store.png';
import financeiro from '../../../assets/images/financeiro.png';
import profile from '../../../assets/images/Perfil2.png';
import {Icon} from './styles';

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
    | 'rela'
    | 'time'
    | 'entrega'
    | 'store'
    | 'pedidos'
    | 'profile'
    | 'financeiro'
    | 'market';
  styles?: StyleProp<ViewStyle>;
}

const CustomIcon: React.FC<IconProps> = ({name, styles = {}}) => {
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
    rela,
    pedidos,
    time,
    entrega,
    store,
    financeiro,
    profile,
  };

  return <Icon source={iconDescriptors[name]} style={styles} />;
};

export default CustomIcon;
