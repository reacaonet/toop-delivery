import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../../../styles';

export const Container = styled.View.attrs({ marginHorizontal: 19 })`
  flex: 1;
  margin-top: 30px;
  margin-bottom: 10px;
  justify-content: center;
`;

export const ViewHeader = styled.View`
  margin-bottom: 20px;
  flex-direction: row;
  align-items: flex-end;
`;

export const TextHeader = styled.Text`
  color: ${Colors.BLACK};
  font-size: ${Typography.FONT_SIZE_13 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;

export const Line = styled.View`
  width: 100%;
  margin-left: 5px;
  border-top-width: 0.3px;
  border-top-color: ${Colors.GRAY_MEDIUM};
`;
