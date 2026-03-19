import { StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { Colors, Typography } from '../../../../../styles';

export const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: Colors.BLACK,
  },
  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5,
  },
});

export const Area = styled.SafeAreaView`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;

export const DigiteCodeTouch = styled.TouchableOpacity`
  width: 90%;
  padding: 15px 10px;
  background-color: ${Colors.PRIMARY};
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`;

export const DigiteCodeTxt = styled.Text`
  font-size: ${Typography.FONT_SIZE_14 + 'px'};
  color: ${Colors.WHITE};
`;

export const ContainerCode = styled.View`
  flex: 1;
  background-color: ${Colors.WHITE};
  margin: 20px 20px 0px 20px;
`;

export const CodeTitle = styled.Text`
  font-size: ${Typography.FONT_SIZE_16 + 'px'};
  color: ${Colors.BLACK};
  font-weight: bold;
`;

export const CodeInput = styled.TextInput`
  width: 100%;
  height: 50px;
  background-color: ${Colors.WHITE};
  border-color: ${Colors.GRAY_MEDIUM};
  border-width: 1px;
  border-radius: 5px;
  margin-top: 20px;
  color: ${Colors.BLACK};
  padding-left: 10px;
  padding-right: 10px;
`;

export const ConfirmTouch = styled.TouchableOpacity`
  width: 100%;
  padding: 15px 10px;
  background-color: ${Colors.PRIMARY};
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 45px;
`;

export const ConfirmTxt = styled.Text`
  font-size: ${Typography.FONT_SIZE_16 + 'px'};
  color: ${Colors.WHITE};
  font-weight: bold;
`;

export const Header = styled.View`
  width: 100%;
  margin-top: 30px;
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
  background-color: ${Colors.WHITE};
`;
