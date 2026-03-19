import styled from 'styled-components/native';
import {Dimensions, StyleSheet} from 'react-native';
import {Colors, Typography} from '../../../../../styles';

export const styles = StyleSheet.create({
  iconStyle: {
    marginRight: 5,
  },
});

export const styleGooglePlace = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    // zIndex: 999,
    // marginLeft: 20,
    // marginRight: 20,
  },
  listView: {
    flex: 1,
    marginTop: 10,
    marginLeft: -20,
  },
  textInput: {
    color: Colors.PRIMARY_DARK,
    height: 45,
    backgroundColor: Colors.GREY_BACKGROUND,
    borderRadius: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    fontSize: 13,
  },
  row: {
    width: Dimensions.get('window').width,
  },
});

export const ContainerModal = styled.Modal`
  flex: 1;
  background-color: ${Colors.WHITE};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${Colors.WHITE};
`;

export const MenuButton = styled.TouchableOpacity`
  padding: 10px;
`;

export const HeaderTitle = styled.Text`
  flex: 1;
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.BLACK};
  text-align: right;
  margin-right: 20px;
`;

export const Divider = styled.View`
  position: absolute;
  top: 50px;
  width: 100%;
  height: 1px;
  background-color: ${Colors.WHITE};
  elevation: 1;
`;

export const DividerList = styled.View`
  flex: 1;
  flex-direction: row;
  height: 0.5px;
  background-color: ${Colors.GRAY_LIGHT};
  elevation: 2;
`;

export const Content = styled.View`
  flex: 1;
  margin-top: 10px;
  margin-left: 20px;
  margin-right: 20px;
`;

export const ListPlaces = styled.FlatList`
  background-color: ${Colors.WHITE};
`;

export const ListItemPlace = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  padding-top: 8px;
  padding-bottom: 8px;
  align-items: center;
  background-color: ${Colors.WHITE};
`;

export const ListItem = styled.View`
  flex: 1;
  flex-direction: row;
  padding-top: 8px;
  padding-bottom: 8px;
  align-items: center;
  background-color: ${Colors.WHITE};
`;

export const TitleListItem = styled.Text<{
  color?: string;
}>`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${props => (props.color ? props.color : Colors.PRIMARY)};
`;

export const TitleList = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.BLACK};
`;

export const ContainerRegister = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const TextLabel = styled.Text`
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 20px;
  flex-direction: row;
  color: ${Colors.GRAY_MAX_DARK};
  font-family: ${Typography.FONT_FAMILY_MEDIUM};
  font-size: ${Typography.FONT_SIZE_12}px;
`;

export const Input = styled.TextInput`
  width: 100%;
  height: 45px;
  align-self: center;
  border-bottom-color: ${Colors.GRAY_LIGHT};
  border-bottom-width: 1px;
  padding-left: 20px;
  color: ${Colors.BLACK};
`;

export const BtnSave = styled.TouchableOpacity`
  width: 90%;
  padding: 10px;
  margin-left: 5%;
  background-color: ${Colors.PRIMARY};
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 2px;
`;

export const TxtBtnSave = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.WHITE};
`;
