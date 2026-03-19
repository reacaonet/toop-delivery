import styled from 'styled-components/native';
import { Typography, Colors } from '../../../../../styles';

export const Container = styled.View`
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const Title = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_20}px;
  color: ${Colors.BLACK};
`;

export const SubTitle = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.BLACK};
  margin-top: 10px;
`;

export const Content = styled.View`
  flex-direction: column;
  margin-top: 15px;
`;

export const ContentImage = styled.View`
  margin-top: 15px;
  margin-bottom: 15px;
`;

export const TextSelectDocument = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.BLACK};
`;

export const Image = styled.Image`
  width: 100%;
  height: 250px;
`;

export const UploadDocument = styled.TouchableOpacity`
  background-color: ${Colors.BUTTOM_PRIMARY};
  margin-top: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;
export const TextDocument = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.WHITE};
  text-transform: uppercase;
`;

export const UploadPhoto = styled.TouchableOpacity`
  background-color: ${Colors.BUTTOM_PRIMARY};
  padding-top: 10px;
  padding-bottom: 10px;
  justify-content: center;
  align-items: center;
`;
export const TextPhoto = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.WHITE};
  text-transform: uppercase;
`;

export const ConfirmPhoto = styled.TouchableOpacity`
  background-color: ${Colors.BUTTOM_PRIMARY};
  padding-top: 10px;
  padding-bottom: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const ConfirmTextPhoto = styled.Text`
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_16}px;
  color: ${Colors.WHITE};
`;

export const CancelButton = styled.TouchableOpacity`
  background-color: ${Colors.GRAY_MEDIUM};
  padding-top: 10px;
  padding-bottom: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const LoadContent = styled.View`
  height: 150px;
  margin-top: 20px;
  justify-content: center;
  align-items: center;
`;

export const LoadIndicator = styled.ActivityIndicator``;
