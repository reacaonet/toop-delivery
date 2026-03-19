import styled from 'styled-components/native';
import {StyleSheet, Dimensions} from 'react-native';
import {Colors, Typography} from '../../styles';

export const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '70%',
  },
  modalStyles: {
    width: '100%',
    height: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // overflow: 'hidden',
  },
  modalOverlay: {
    // backgroundColor: 'transparent',
  },
  placeholderColorError: {
    color: Colors.ALERT,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  inputFlex: {
    flex: 1,
    color: Colors.DARK,
  },
  textInput: {
    borderBottomWidth: 0.5,
    borderColor: Colors.GREY,
    marginHorizontal: 10,
    paddingVertical: 0,
    minHeight: 35,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.PRIMARY,
  },
  txtError: {
    color: Colors.ALERT,
  },
  titleFavorite: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.GREY,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  favoriteOption: {
    flexDirection: 'row',
    marginHorizontal: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: Colors.GREY,
    borderRadius: 15,
    flex: 1,
    paddingVertical: 5,
  },
  ml10: {
    marginLeft: 10,
  },
  mr10: {
    marginRight: 10,
  },
  optionContainerSelect: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.BACKGROUND,
  },
  colorWhite: {
    color: Colors.WHITE,
  },
  colorGrey: {
    color: Colors.GREY,
  },
  txtOption: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.GREY,
    marginLeft: 10,
  },
});

export const Container = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${Colors.WHITE};
  align-self: center;
`;

export const ContainerMap = styled.View`
  flex: 1;
  margin-top: 5px;
  background-color: ${Colors.WHITE};
`;

export const ContentMarker = styled.View`
  position: absolute;
  top: 0;
  bottom: 30px;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  background-color: transparent;
`;

export const Image = styled.Image`
  width: 30px;
  height: 30px;
  margin-top: 20px;
  margin-left: 15px;
`;

export const ContainInput = styled.View`
  flex-direction: row;
  width: 90%;
  position: absolute;
  align-self: center;
  margin-top: 20px;
`;

export const Inputstyle = styled.TextInput`
  width: 85%;
  height: 45px;
  margin-left: 20px;
  padding-left: 10px;
  background-color: ${Colors.GRAY_LIGHT};
  border-color: ${Colors.PRIMARY};
  border-width: 2px;
  border-radius: 8px;
  border-style: solid;
`;

export const Dot = styled.Text`
  height: 8px;
  width: 8px;
  background-color: ${Colors.GRAY_MAX_DARK};
  margin-left: 10px;
  margin-top: 15px;
  border-radius: 50px;
  color: ${Colors.GRAY_MAX_DARK};
`;

export const Border = styled.View`
  border-bottom-width: 3px;
  border-bottom-color: ${Colors.GRAY_LIGHT};
  margin-top: 30px;
`;

export const ViewText = styled.View`
  flex-direction: row;
`;

export const Text = styled.Text`
  font-size: 12px;
  margin-top: 20px;
  margin-left: 10px;
  color: ${Colors.GRAY_DARK};
  font-weight: bold;
`;

export const TouchMap = styled.TouchableOpacity`
  width: 60%;
  margin-left: 15%;
  padding: 10px;
  background-color: ${Colors.PRIMARY};
  position: absolute;
  bottom: 3px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`;

export const TextMapConfirm = styled.Text`
  font-size: 12px;
  color: ${Colors.WHITE};
`;

export const ModalContainer = styled.ScrollView`
  flex: 1;
  flex-direction: column;
  padding: 20px 20px;
`;

export const TextAddress = styled.Text`
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.BLACK};
  font-weight: bold;
  margin-left: 5px;
`;

export const TextInputAddress = styled.TextInput`
  /* border-bottom-width: 0.5px; */
  border-color: ${Colors.GREY};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  font-size: ${Typography.FONT_SIZE_14}px;
  color: ${Colors.PRIMARY};
`;

export const TouchSingleDelivery = styled.TouchableOpacity`
  margin-top: 20px;
  width: 90%;
  margin-left: 5%;
  padding: 10px;
  background-color: ${Colors.PRIMARY};
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`;

export const TextTouchSingle = styled.Text`
  font-size: 12px;
  color: ${Colors.WHITE};
`;
