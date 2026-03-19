import styled from 'styled-components/native';
import {Colors, Typography} from '../../../../../../styles';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-top: 60px;
`;

export const Button = styled.TouchableOpacity`
  width: 80%;
  height: 44px;
  border-radius: 7px;
  align-items: center;
  justify-content: center;
  background-color: ${Colors.DARK};
`;

export const ButtonDelete = styled.TouchableOpacity`
  width: 80%;
  height: 44px;
  border-radius: 7px;
  margin-top: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${Colors.ALERT};
`;

export const TextButton = styled.Text`
  color: ${Colors.WHITE};
  font-size: ${Typography.FONT_SIZE_15 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;
