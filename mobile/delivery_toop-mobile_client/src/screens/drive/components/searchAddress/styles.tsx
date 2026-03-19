import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../styles';
import { View } from 'react-native';

export const Container = styled.View`
  flex-direction: row;
  background-color: ${Colors.WHITE};
  align-items: center;
  border-radius: 2px;
  border-width: 0.5px;
  border-color: ${Colors.GRAY_LIGHT};
  background-color: ${Colors.GRAY_LIGHT};
  padding: 0px 12px;
  margin: 10px 15px 0px 15px;
  elevation: 3;
`;

export const Title = styled.Text`
  text-align: justify;
  color: ${Colors.GRAY_DARK};
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 14px;
  margin-left: 5px;
`;

export const Address = styled.TextInput`
  height: 50px;
  font-size: 16px;
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  color: ${Colors.BLACK};
  margin-left: 5px;
  flex: 1;
`;
