import { StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';

export const styles = StyleSheet.create({
  icon: {
    marginLeft: 10,
    color: Colors.PRIMARY,
  },
});

export const Container = styled.View`
  margin-top: 10px;
  border-radius: 7px;
  flex-direction: row;
  align-items: center;
  background-color: ${Colors.WHITE};
`;

export const TextSearch = styled.TextInput`
  flex: 1;
  margin-left: 10px;
  color: ${Colors.PRIMARY_DARK};
  font-size: ${Typography.FONT_SIZE_15 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;

export const TouchSearch = styled.TouchableOpacity`
  justify-content: center;
`;

export const TouchBox = styled.TouchableOpacity`
  flex: 1;
  height: 40px;
  margin-left: 20px;
  margin-right: 20px;
  border-radius: 7px;
  flex-direction: row;
  background-color: ${Colors.GREY_BACKGROUND};
`;
