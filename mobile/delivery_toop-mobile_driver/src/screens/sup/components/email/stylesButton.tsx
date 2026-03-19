import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../styles';

export const ButtonData = styled.TouchableOpacity`
  padding: 10px;
  width: 84%;
  margin-top: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.PRIMARY};
  elevation: 3;
`;

export const ButtonDataText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 16px;
  color: ${Colors.WHITE};
`;
