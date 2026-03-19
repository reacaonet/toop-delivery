import {} from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography } from '../../styles';

export const Container = styled.ScrollView`
  flex: 1;
  background-color: ${Colors.WHITE};
  padding-bottom: 30px;
  margin-bottom: 30px;
`;

export const Header = styled.View`
  flex-direction: row;
  width: 100%;
  background-color: ${Colors.WHITE};
  elevation: 3;
`;

export const HeaderTitle = styled.Text`
  flex: 1;
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.PRIMARY};
  text-align: center;
  align-items: center;
  align-self: center;
`;

export const HeaderIconTouch = styled.TouchableOpacity`
  padding: 5px;
`;

export const HeaderIcon = styled(Icon)``;

export const Content = styled.KeyboardAvoidingView`
  flex: 1;
  margin: 20px;
  background-color: ${Colors.WHITE};
`;

export const InputText = styled.TextInput`
  height: 50px;
  width: 100%;
  border-bottom-width: 1.2px;
  padding: 0px 10px;
  border-color: ${Colors.GRAY_MEDIUM};
  margin-top: 15px;
  margin-bottom: 6px;
  color: ${Colors.BLACK};
`;

export const InputPasswordContent = styled.View`
  flex-direction: row;
`;

export const IconInput = styled(Icon)`
  position: absolute;
  margin-top: 25px;
  right: 10px;
`;

export const ContentButton = styled.View`
  margin-bottom: 5px;
  width: 100%;
  justify-content: space-around;
  flex-direction: row;
`;

export const TouchButton = styled.TouchableOpacity`
  margin-top: 10px;
  padding: 10px;
  width: 100%;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.PRIMARY};
  elevation: 3;
`;

export const TxtButton = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 16px;
  color: ${Colors.WHITE};
`;
