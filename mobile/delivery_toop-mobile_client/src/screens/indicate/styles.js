import styled from 'styled-components/native';
import {StyleSheet} from 'react-native';

import {Colors, Typography} from '../../styles';
import {GRAY_DARK, GRAY_LIGHT} from '../../styles/colors';

export const styles = StyleSheet.create({
  icon: {
    marginTop: 22,
    marginLeft: 25,
  },

  iconGoBack: {
    color: Colors.PRIMARY,
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

export const ImageIndique = styled.Image`
  width: 90px;
  height: 90px;
  align-self: center;
`;

export const SubText = styled.Text`
  margin-top: 5px;
  top: 10px;
  text-align: center;
  font-size: 18px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  font-weight: bold;
  color: ${Colors.PRIMARY};
`;

export const LongText = styled.Text`
  font-size: 15px;
  margin-top: 30px;
  text-align: center;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.GRAY_TEXT};
`;

export const ContainSubTitle = styled.TouchableOpacity`
  width: 90%;
  height: 70px;
  margin-top: 40px;
  border-radius: 8px;
  justify-content: space-between;
  background-color: ${Colors.PRIMARY};
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
  margin-top: 15px;
  margin-right: 25px;
  font-size: 28px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.WHITE};
`;

export const TextFooter = styled.Text`
  font-size: 15px;
  margin-top: 30px;
  text-align: center;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.PRIMARY};
`;

export const ContainFooter = styled.View`
  width: 100%;
  height: 80px;
  bottom: 0px;
  position: absolute;
  justify-content: center;
  background-color: ${Colors.PRIMARY};
  align-items: center;
`;

export const TextContainFooter = styled.Text`
  margin-top: 10px;
  margin-right: 15px;
  font-size: 18px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.WHITE};
`;
