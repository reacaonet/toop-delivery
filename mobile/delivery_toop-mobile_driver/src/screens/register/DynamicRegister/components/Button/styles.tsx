import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';

export const Container = styled.TouchableOpacity<{ color: string }>`
  flex: 1;
  flex-direction: row;
  background-color: ${props => (props?.color ? props?.color : Colors.PRIMARY)};
  padding-top: 10px;
  padding-bottom: 10px;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  elevation: 3;
`;

export const Text = styled.Text<{ textColor: string }>`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_15}px;
  color: ${props => (props?.textColor ? props?.textColor : Colors.PRIMARY)};
`;

export const LoadIndicator = styled.ActivityIndicator`
  color: ${Colors.WHITE};
`;
