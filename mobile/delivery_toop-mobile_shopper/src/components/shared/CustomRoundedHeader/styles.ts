import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export const Header = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  height: 65px;
  border-radius: 36px;
  margin: 5px 15px;
  padding-left: 10px;
`;

export const TextWrapper = styled.View`
  height: 100%;
  margin-left: 5px;
  padding: 15px 0 5px 0;
  flex: 1;
`;

export const HeaderTitle = styled.Text`
  color: #fff;
  font-size: 13px;
  font-weight: bold;
`;

export const HeaderSubTitle = styled.Text.attrs({numberOfLines: 1})`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

export const AvatarImg = styled.Image.attrs({})`
  width: 40px;
  height: 40px;
  border-radius: 20px;
`;

export const ChildrenWrapper = styled.View`
  flex-direction: row-reverse;
  padding-left: 20px;
`;
