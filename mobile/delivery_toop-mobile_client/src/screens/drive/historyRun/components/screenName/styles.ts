import styled from 'styled-components/native';
import {StyleSheet} from 'react-native';

import {Colors, Typography} from '../../../../../styles';

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
  downPickerContStyle: {
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    width: '90%',
    alignSelf: 'center',
    zIndex: 999,
  },
  downPickerStyle: {
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    width: '100%',
    alignSelf: 'center',
  },
  flatStyle: {
    marginBottom: 5,
    marginTop: 10,
  },
});

export const Container = styled.TouchableOpacity`
  width: 90%;
  height: 120px;
  border-radius: 8px;
  margin-top: 10px;
  background-color: ${Colors.GRADIENTE_GREY_BOX};
  align-self: center;
`;

export const Contain = styled.View`
  width: 90%;
  height: 40px;
  border-radius: 8px;
  margin-top: 10px;
  background-color: ${Colors.GRADIENTE_GREY_BOX};
  align-self: center;
`;

export const DrawerHeaderWrapper = styled.View`
  background: ${Colors.BLACK};
  height: 30%;
  flex-direction: row;
`;

export const Border = styled.View`
  width: 90%;
  margin-top: 20px;
  align-self: center;
  border-color: ${Colors.WHITE};
  border-width: 1px;
`;

export const ContainerText = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const ButtonContain = styled.View`
  align-self: center;
  height: 40px;
  background-color: ${Colors.PRIMARY};
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  width: 100%;
`;

export const ButtonContainText = styled.Text`
  color: ${Colors.WHITE};
  margin-left: 10px;
  margin-top: 10px;
`;

export const Text = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  margin-left: 20px;
  font-size: 17px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.BLACK};
`;

export const SubText = styled.Text`
  margin-top: 5px;
  margin-right: 20px;
  margin-left: 20px;
  font-size: 15px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.GRAY_TEXT};
`;

export const Button = styled.View`
  flex-direction: row;
  width: 100%;
`;

export const ViewText = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const Area = styled.SafeAreaView`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

export const TextTitle = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  margin-left: 20px;
  font-size: 17px;
  font-family: ${Typography.FONT_FAMILY_LIGHT};
  color: ${Colors.GRAY_TEXT};
`;

export const Title = styled.Text`
  margin-top: 10px;
  margin-right: 20px;
  font-weight: bold;
  font-size: 18px;
  color: ${Colors.BLACK};
  text-transform: uppercase;
`;

export const ContainIndex = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
`;
