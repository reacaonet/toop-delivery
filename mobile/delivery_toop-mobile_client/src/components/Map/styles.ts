import { StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { Colors, Typography } from '../../styles';

const styles = StyleSheet.create({
  map: {
    // ...StyleSheet.absoluteFillObject,
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export const ButtonLocation = styled.TouchableOpacity`
  position: absolute;
  bottom: 75px;
  right: 5px;
  padding: 5px;
  background-color: ${Colors.WHITE};
  z-index: 10;
  elevation: 3;
`;

export const ContainerLoad = styled.View`
  flex: 1;
  justify-content: center;
  align-content: center;
`;

export const Load = styled.ActivityIndicator``;

export const LoadText = styled.Text`
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.GRAY_DARK};
  text-align: center;
`;

export default styles;
