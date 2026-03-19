import React from 'react';
import {
  Header,
  HeaderTitle,
  IconWrapper,
  TextWrapper,
  HeaderSubTitle,
  AvatarImg,
} from './styles';

import Icon from 'react-native-vector-icons/Feather';
import {ImageURISource} from 'react-native';
import {Colors} from '../../../styles';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  avatarImg?: ImageURISource[];
  closeChat?: any;
}

const CustomHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  avatarImg,
  closeChat,
}) => {
  return (
    <Header colors={Colors.GRADIENTE_GREY}>
      <IconWrapper>
        <Icon
          name="chevron-left"
          size={34}
          color="#fff"
          onPress={() => closeChat()}
        />
      </IconWrapper>
      {avatarImg && <AvatarImg source={avatarImg} />}
      <TextWrapper>
        <HeaderTitle>{title}</HeaderTitle>
        {subtitle ? (
          <HeaderSubTitle numberOfLines={1}>{subtitle}</HeaderSubTitle>
        ) : null}
      </TextWrapper>
    </Header>
  );
};

CustomHeader.defaultProps = {
  title: 'Cliente:',
  subtitle: 'User',
};

export default CustomHeader;
