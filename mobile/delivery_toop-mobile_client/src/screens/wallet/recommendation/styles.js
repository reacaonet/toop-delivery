import styled from 'styled-components/native';
import {StyleSheet} from 'react-native';

import {Colors, Typography} from '../../../styles';
import {GRAY_TEXT, GRAY_DARK} from '../../../styles/colors';

export const styles = StyleSheet.create({
  icon: {
    color: Colors.PRIMARY,
    marginRight: 10,
    marginTop: 10,
  },

  iconGoBack: {
    color: Colors.PRIMARY,
    marginLeft: 5,
  },
});

export const Container = styled.View`
  width: 90%;
  height: 90px;
  border-radius: 4px;
  flex-direction: row;
  align-self: center;
  margin-top: 10px;
  background-color: ${Colors.GRADIENTE_GREY_BOX};
`;

export const ImageCard = styled.Image`
  width: 55px;
  height: 55px;
  border-radius: 4px;
  margin-top: 20px;
  margin-left: 10px;
`;
export const Area = styled.SafeAreaView`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

export const Title = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  font-weight: bold;
  font-size: 18px;
  color: ${Colors.PRIMARY};
`;

export const ContainIndex = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const Text = styled.Text`
  margin-top: 10px;
  margin-left: 10px;
  font-size: 17px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.PRIMARY};
`;

export const SubText = styled.Text`
  margin-top: 5px;
  margin-left: 10px;
  font-size: 13px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.GRAY_MAX_DARK};
`;

export const ViewCard = styled.View`
  width: 50%;
  flex-direction: column;
  margin-bottom: 5px;
  background-color: ${Colors.GRADIENTE_GREY_BOX};
  align-self: center;
`;

export const Recebe = styled.Text`
  width: 20%;
  margin-top: 30px;
  margin-left: 30px;
  font-size: 17px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.PRIMARY};
`;
