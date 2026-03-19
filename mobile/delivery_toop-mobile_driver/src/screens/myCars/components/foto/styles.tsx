import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../styles';

export const Container = styled.View`
  flex: 1;
`;

export const TouchButtonLogin = styled.TouchableOpacity`
  padding: 10px;
  width: 90%;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.PRIMARY};
  elevation: 3;
`;

export const TxtButtonLogin = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 16px;
  color: ${Colors.WHITE};
`;

export const Text = styled.Text`
  padding: 10px;
  width: 90%;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.GREY};
  elevation: 3;
`;

export const TextContain = styled.Text`
  padding: 10px;
  width: 90%;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  text-align: center;
  background-color: #efefef;
`;
