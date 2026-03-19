import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../styles';

export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 5px;
`;

export const TextSelf = styled.Text`
  margin-top: 20px;
  margin-bottom: 20px;
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 17px;
  color: ${Colors.GRAY_DARK};
`;

export const TextBold = styled.Text`
  font-family: ${Typography.FONT_FAMILY_BOLD};
  font-size: 17px;
  font-weight: bold;
  color: ${Colors.GRAY_MAX_DARK};
`;

export const TextInstruction = styled.Text`
  /* margin-top: 20px; */
  margin-bottom: 5px;
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: 15px;
  color: ${Colors.GRAY_DARK};
`;

export const ContentPhoto = styled.Image`
  width: 100%;
  height: 40%;
  margin-top: 20px;
  background-color: ${Colors.GRAY_LIGHT};
  elevation: 2;
`;

export const ContentButton = styled.View`
  position: absolute;
  margin-left: 20px;
  bottom: 10px;
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
