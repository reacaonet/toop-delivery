import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';

import { Colors, Typography } from '../../../styles';

export const styles = StyleSheet.create({
  icon: {
    color: Colors.BLACK,
    marginRight: 10,
    marginTop: 10,
  },

  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5,
  },
});

export const ContainIndex = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const Area = styled.SafeAreaView`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

export const ImageEmpresa = styled.Image`
  width: 90px;
  height: 90px;
  align-self: center;
  margin-top: 30px;
`;

export const SubText = styled.Text`
  margin-top: 5px;
  top: 10px;
  text-align: center;
  font-size: 18px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  font-weight: bold;
  color: ${Colors.BLACK};
`;

export const LongText = styled.Text`
  font-size: 15px;
  margin-top: 30px;
  text-align: center;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.GRAY_TEXT};
`;

export const ContainSubTitle = styled.View`
  width: 100%;
  height: 90px;
  margin-top: 10px;
  justify-content: space-between;
  background-color: ${Colors.GRADIENTE_GREY_BOX};
  align-self: center;
`;

export const ViewCard = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const ImageCard = styled.Image`
  width: 40px;
  height: 40px;
  margin-top: 25px;
  margin-left: 20px;
`;

export const TextCard = styled.Text`
  margin-top: 30px;
  margin-right: 15px;
  font-size: 18px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.BLACK};
`;

export const TextFooter = styled.Text`
  font-size: 15px;
  margin-top: 30px;
  text-align: center;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.BLACK};
`;

export const ContainFooter = styled.TouchableOpacity`
  width: 100%;
  height: 80px;
  bottom: 0px;
  position: absolute;
  justify-content: center;
  background-color: ${Colors.BLACK};
  align-items: center;
`;

export const TextContainFooter = styled.Text`
  margin-top: 10px;
  font-size: 18px;
  text-align: center;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.WHITE};
`;

export const Title = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  font-weight: bold;
  font-size: 18px;
  color: ${Colors.BLACK};
`;
export const Devider = styled.View`
  margin-top: 20px;
`;

export const Input = styled.TextInput`
  width: 90%;
  height: 45px;
  align-self: center;
  margin-top: 10px;
  border-color: ${Colors.GRAY_TEXT};
  border-width: 1;
  border-radius: 8px;
  padding-left: 20px;
`;
export const SubTitle = styled.Text`
  margin-top: 5px;
  margin-left: 30px;
  top: 10px;
  text-align: left;
  font-size: 18px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.BLACK};
`;

export const Sub = styled.Text`
  margin-top: 5px;
  margin-left: 30px;
  top: 10px;
  text-align: left;
  font-size: 18px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.GRAY_TEXT};
`;

export const ViewInput = styled.View`
  flex-direction: row;
  justify-content: space-between
  margin-right: 40px;
`;

export const InputAddress = styled.TextInput`
  width: 60%;
  height: 45px;
  margin-left: 20px;
  margin-top: 10px;
  border-color: ${Colors.GRAY_TEXT};
  border-width: 1;
  border-radius: 8px;
  padding-left: 20px;
`;

export const InputNum = styled.TextInput`
  width: 35%;
  height: 45px;
  margin-left: 20px;
  margin-top: 10px;
  border-color: ${Colors.GRAY_TEXT};
  border-width: 1;
  border-radius: 8px;
  padding-left: 20px;
`;

export const Button = styled.TouchableOpacity`
  width: 90%;
  height: 60px;
  border-radius: 10px;
  position: absolute;
  bottom: 0;
  margin-bottom: 10px;
  align-self: center;
  background-color: ${Colors.PRIMARY};
`;

export const ViewCheck = styled.View`
  flex-direction: row;
`;

export const TextButton = styled.Text`
  margin-top: 5px;
  top: 10px;
  text-align: center;
  font-size: 18px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.WHITE};
`;
