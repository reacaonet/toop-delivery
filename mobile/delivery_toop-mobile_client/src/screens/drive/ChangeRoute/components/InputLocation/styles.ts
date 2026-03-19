import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';

export const Container = styled.TouchableOpacity`
  flex-direction: row;
  height: 40px;
  align-items: center;
  background-color: ${Colors.WHITE};
  padding-left: 5px;
  /* border-width: 0.5px; */
  border-radius: 5px;
  elevation: 3;
  margin-bottom: 8px;
`;

export const Title = styled.Text`
  font-size: ${Typography.FONT_SIZE_14}px;
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  color: ${Colors.BLACK};
  flex: 1;
`;

export const CloseContainer = styled.TouchableOpacity`
  padding: 5px;
  /* background-color: orange; */
  align-items: flex-end;
`;
