import styled from 'styled-components/native';
import { Colors } from '../../styles';

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
  justify-content: center;
  align-items: center;
`;

export const ImageContent = styled.Image`
  width: 60%;
  /* height: 30%; */
`;

export const LoadActivity = styled.ActivityIndicator`
  width: 80px;
  height: 80px;
`;
