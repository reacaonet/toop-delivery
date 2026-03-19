import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';
import LinearGradient from 'react-native-linear-gradient';

export const Container = styled.View`
  position: absolute;
  bottom: 10px;
  width: 100%;
  margin-left: 20px;
  background-color: ${Colors.WHITE};
`;

export const ContentButton = styled.View`
  width: 100%;
  justify-content: space-around;
  flex-direction: row;
`;

export const Background = styled(LinearGradient).attrs({
  colors: Colors.GRADIENTE_SECONDARY,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
})`
  width: 100%;
  padding: 10px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

export const TouchButton = styled.TouchableOpacity`
  width: 100%;
  /* padding: 10px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.BLACK}; */
`;

export const TxtButton = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 16px;
  color: ${Colors.WHITE};
`;
