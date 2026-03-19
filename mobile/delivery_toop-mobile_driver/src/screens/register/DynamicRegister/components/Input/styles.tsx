import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';
import { TextInputMask } from 'react-native-masked-text';

export const Container = styled.View`
  background-color: ${Colors.WHITE};
  flex-direction: column;
`;

export const Title = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: ${Typography.FONT_SIZE_20}px;
  color: ${Colors.BLACK};
  margin-bottom: 10px;
`;

export const SubTitle = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.GRAY_TEXT};
  margin-bottom: 20px;
`;

export const TextInput = styled.TextInput`
  flex: 1;
  height: 55px;
  padding-left: 10px;
  padding-right: 10px;
  border-width: 0.5px;
  elevation: 1;
  border-color: ${Colors.GREY_LIGHT};
  border-radius: 5px;
  background-color: ${Colors.WHITE};
  margin-bottom: 15px;
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.BLACK};
`;

export const InputMask = styled(TextInputMask).attrs({})`
  flex: 1;
  height: 55px;
  padding-left: 10px;
  padding-right: 10px;
  border-width: 0.5px;
  elevation: 1;
  border-color: ${Colors.GREY_LIGHT};
  border-radius: 5px;
  background-color: ${Colors.WHITE};
  margin-bottom: 15px;
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.BLACK};
`;
