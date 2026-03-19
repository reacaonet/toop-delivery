import React from 'react';

import Plus from './svg-files/plus.svg';
import Wallet from './svg-files/carteira.svg';

export const PlusIcon = ({ color = '#000000', width = 28, height = 28 }) => (
  <Plus style={{ color }} width={width} height={height} />
);

export const WalletIcon = ({ color = '#ffffff', width = 28, height = 28 }) => (
  <Wallet style={{ color }} width={width} height={height} />
);
