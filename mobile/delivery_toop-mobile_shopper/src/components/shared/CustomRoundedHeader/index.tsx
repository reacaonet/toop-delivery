import React from 'react';
import {ImageURISource} from 'react-native';
import {
  Header,
  HeaderTitle,
  ChildrenWrapper,
  TextWrapper,
  HeaderSubTitle,
  AvatarImg,
} from './styles';

import {Colors} from '../../../styles';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  avatarImg?: ImageURISource[];
  children?: React.ReactNode;
}

const CustomHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  avatarImg,
  children,
}) => {
  return (
    <Header colors={Colors.GRADIENTE_PRIMARY}>
      {avatarImg ? <AvatarImg source={avatarImg} /> : null}
      <TextWrapper>
        <HeaderTitle>{title}</HeaderTitle>
        {subtitle && <HeaderSubTitle>{subtitle}</HeaderSubTitle>}
      </TextWrapper>
      <ChildrenWrapper>{children}</ChildrenWrapper>
    </Header>
  );
};

CustomHeader.defaultProps = {
  title: 'Cliente:',
  subtitle: 'User',
};

export default CustomHeader;
