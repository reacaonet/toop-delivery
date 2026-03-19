import styled from 'styled-components/native';
import { Typography, Colors } from '../../../../../styles';

export const Container = styled.View`
  min-height: 50px;
  flex-direction: column;
  margin-top: 15px;
  margin-bottom: 15px;
`;

export const ContentImage = styled.View`
  margin-top: 15px;
  margin-bottom: 15px;
`;

export const Image = styled.Image`
  width: 100%;
  height: 250px;
`;

export const TextSelectDocument = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.BLACK};
`;
