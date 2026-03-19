import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../../styles';

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
  padding: 20px;
`;

export const TextSelf = styled.Text`
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: 20px;
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 15px;
  color: ${Colors.GRAY_DARK};
`;

export const TextBold = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: 16px;
  font-weight: bold;
  color: ${Colors.GRAY_MAX_DARK};
`;

export const TextInstruction = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 14px;
  color: ${Colors.GRAY_DARK};
  margin-left: 20px;
`;

export const ContentPhoto = styled.View`
  width: 100%;
  height: 40%;
  margin-top: 20px;
  background-color: ${Colors.GRAY_LIGHT};
  elevation: 2;
`;

export const ContentButton = styled.View`
  position: absolute;
  margin-left: 0px;
  /* margin-bottom: 5px; */
  bottom: 0px;
  width: 100%;
  justify-content: space-around;
  flex-direction: row;
`;

export const ButtonPhoto = styled.TouchableOpacity`
  padding: 10px;
  width: 47%;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.PRIMARY};
  elevation: 3;
`;

export const ButtonPhotoText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 16px;
  color: ${Colors.WHITE};
`;

export const ButtonJump = styled.TouchableOpacity`
  padding: 10px;
  width: 47%;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.GRAY_LIGHT};
  elevation: 3;
`;

export const ButtonJumpText = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 16px;
  color: ${Colors.BLACK};
`;
