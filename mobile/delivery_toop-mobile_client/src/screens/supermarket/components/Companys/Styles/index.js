import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';

export const Container = styled.View.attrs({ marginHorizontal: 19 })`
  flex: 1;
  margin-top: 30px;
  margin-bottom: 10px;
  justify-content: center;
`;

export const ViewLoading = styled.View.attrs({ marginHorizontal: 19 })`
  flex: 1;
  margin-top: 30px;
  margin-bottom: 10px;
  justify-content: center;
  align-items: center;
`;

export const TextNotFound = styled.Text`
  text-align: center;
  color: ${Colors.GREY};
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;
