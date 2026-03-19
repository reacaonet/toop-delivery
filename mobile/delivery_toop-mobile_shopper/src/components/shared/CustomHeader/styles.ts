import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
// import {StatusBar} from 'react-native';
import {Colors} from '../../../styles'

export const Header = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  margin-top: 15px;
  height: 80px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
`;

export const IconWrapper = styled.View`
  margin-left: 5px;
`;

export const TextWrapper = styled.View`
  height: 100%;
  margin-left: 6px;
  padding: 15px 0 5px 0;
`;

export const HeaderTitle = styled.Text`
  color: ${Colors.GRAY}
  font-size: 14px;
  font-weight: bold;
  padding-right: 10px;
`;

export const HeaderSubTitle = styled.Text`
  color: ${Colors.PRIMARY}
  font-size: 18px;
  font-weight: bold;
  padding-right: 10px;
`;

export const AvatarImg = styled.Image.attrs({})`
  width: 54px;
  height: 54px;
`;
