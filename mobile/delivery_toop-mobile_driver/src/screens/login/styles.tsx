import styled from 'styled-components/native';
import { Colors, Typography } from '../../styles';

export const Container = styled.View`
  flex: 1;
  align-items: center;
`;

export const Header = styled.Image`
  width: 100%;
  height: 50%;
`;

export const ContentLogo = styled.View`
  justify-content: center;
  align-items: center;
  margin: 10px 20px;
  height: 20%;
`;

export const ImageLogo = styled.Image`
  width: 50%;
`;

export const ContentButton = styled.View`
  /* margin-bottom: 15px;
  padding: 0 25px; */
  flex: 1;
  width: 100%;
  min-height: 45px;
  justify-content: space-around;
  align-items: flex-end;
  flex-direction: row;
  /* margin-top: 64px; */
`;

export const TouchButtonLogin = styled.TouchableOpacity`
  padding: 10px;
  width: 45%;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.PRIMARY};
  elevation: 3;
`;

export const TxtButtonLogin = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 16px;
  color: ${Colors.WHITE};
`;

export const TouchRegister = styled.TouchableOpacity`
  padding: 10px;
  width: 45%;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.GRAY_LIGHT};
  elevation: 3;
`;

export const TxtRegister = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 16px;
  color: ${Colors.BLACK};
`;

export const InputLogin = styled.TextInput`
  height: 50px;
  width: 100%;
  border-bottom-width: 1.2px;
  padding: 0px 10px;
  border-color: #707070;
  margin-top: 15px;
  margin-bottom: 6px;
  color: ${Colors.BLACK};
`;

export const ContainerScroll = styled.ScrollView`
  flex: 1;
`;

export const ContainerAnimation = styled.View`
  flex-direction: row;
`;

export const TextVersion = styled.Text`
  font-size: 15px;
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  color: ${Colors.GRAY_DARK};
  text-align: center;
  width: 50%;
  margin-bottom: 0px;
`;

export const ForgotPasswordView = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: flex-end;
`;

export const ForgotPasswordTouch = styled.TouchableOpacity`
  padding: 3px;
`;

export const ForgotPasswordTxt = styled.Text`
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  font-size: ${Typography.FONT_SIZE_12}px;
  color: ${Colors.PRIMARY};
`;
