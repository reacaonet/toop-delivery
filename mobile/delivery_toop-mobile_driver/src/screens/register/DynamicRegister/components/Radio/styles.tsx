import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';

export const Container = styled.View`
  background-color: ${Colors.WHITE};
  flex-direction: column;
`;

export const Title = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.BLACK};
  margin-bottom: 20px;
`;

export const ContentItem = styled.TouchableOpacity`
  flex-direction: row;
  width: 90%;
  padding: 5px 16px;
`;

export const Circle = styled.View`
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  margin-right: 12px;
  border-radius: 12px;
  border-width: 2px;
  border-color: ${Colors.PRIMARY};
`;

export const SelectedInnerCircle = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${Colors.PRIMARY};
`;

export const Name = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_15}px;
  color: ${Colors.BLACK};
`;
