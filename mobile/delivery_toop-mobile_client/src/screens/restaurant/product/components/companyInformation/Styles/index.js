import {StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {Colors, Typography} from '../../../../../../styles';

export const styles = StyleSheet.create({
  iconInformation: {
    color: Colors.DARK_LIGHT,
  },
});

export const TouchableOpacity = styled.TouchableOpacity``;

export const TitleCompany = styled.Text`
  color: ${Colors.GREY};
  font-size: ${Typography.FONT_SIZE_18 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
`;

export const Informations = styled.Text`
  color: ${Colors.GREY};
  font-size: ${Typography.FONT_SIZE_12 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  margin-top: 3px;
  margin-left: 10px;
  margin-right: 10px;
`;

export const BoxInformation = styled.View`
  margin-top: 0px;
  margin-bottom: 5px;
  flex-direction: row;
  align-items: center;
`;

export const BoxInformationTitle = styled.View`
  width: 90%;
`;

export const BoxInformationIcon = styled.View`
  align-items: flex-end;
  justify-content: center;
  margin-right: 10px;
  flex: 1;
`;

export const CircleIconInformation = styled.TouchableOpacity`
  border-width: 1.5px;
  border-radius: 50px;
  border-color: ${Colors.DARK_LIGHT};
`;

export const ContainerService = styled.View`
  /* background-color: red; */
  width: 100%;
  margin-left: 10px;
  margin-right: 10px;
`;

export const ContainerAddress = styled.View`
  width: 100%;
`;

export const AddressText = styled.Text`
  color: ${Colors.GREY};
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;

export const ContentSocial = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-right: 10px;
`;

export const ContainerSocial = styled.TouchableOpacity`
  margin-top: 5px;
  padding-left: 5px;
  padding-right: 5px;
  padding-top: 3px;
  padding-bottom: 3px;
  border-radius: 5px;
  background-color: ${Colors.WHITE};
  margin-right: 10px;
  elevation: 3;
  justify-content: center;
  align-items: center;
`;

export const ImageSocial = styled.Image`
  color: ${Colors.GREY};
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  width: 20px;
  height: 20px;
`;

export default styles;
