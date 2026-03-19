import styled from 'styled-components/native';
import {Colors, Typography} from '../../../styles';
import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  lottieStyle: {
    height: 120,
  },
});

export const Container = styled.Modal``;

export const Header = styled.TouchableOpacity`
  flex: 1;
`;

export const Content = styled.View`
  background-color: ${Colors.WHITE};
  width: 100%;
  height: 200px;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 15px;
  elevation: 4;
`;

export const Title = styled.Text`
  font-size: ${Typography.FONT_SIZE_18};
  font-weight: bold;
  color: ${Colors.PRIMARY_DARK};
`;
