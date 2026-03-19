import styled from 'styled-components/native';
import {
  StyleSheet,
  KeyboardAvoidingView as genericKeyboardAvoidingView,
} from 'react-native';
import {Colors, Typography} from '../../styles';

export const customPickerStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.DARK_LIGHT,
    borderRadius: 10,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.DARK_LIGHT,
    borderRadius: 20,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 10,
  },
});

export const Title = styled.Text`
  color: ${Colors.GREY};
  font-size: 16px;
  letter-spacing: 1px;
  font-family: ${Typography.FONT_FAMILY_BOLD};
  margin-bottom: 5px;
  margin-left: 15px;
`;

export const Container = styled.ScrollView.attrs({
  contentContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    paddingHorizontal: 25,
    background: Colors.WHITE,
  },
})`
  background: ${Colors.BACKGROUND};
  margin-top: 25px;
`;

export const SafeAreaView = styled.SafeAreaView`
  flex: 1;
  background: ${Colors.BACKGROUND};
`;

export const KeyboardAvoidingView = styled(genericKeyboardAvoidingView).attrs({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: Colors.PRIMARY,
  },
  enabled: true,
  keyboardVerticalOffset: 130,
  behavior: 'padding',
})`
  width: 100%;
`;

export const ImageVehicle = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 90px;
  height: 90px;
`;

export const ImageDocuments = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 45px;
  height: 45px;
`;

export const Row = styled.View`
  flex-direction: row;
`;

export const ButtonWrapper = styled.View`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

export const CustomHeader = styled.View`
  background: ${Colors.PRIMARY};
  height: 90px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

export const HeaderTitle = styled.Text`
  color: ${Colors.WHITE};
  font-weight: bold;
  font-size: 18px;
`;

export const View = styled.View`
  margin-left: 15px;
`;

export const ViewText = styled.Text`
  color: ${Colors.GREY};
  font-weight: bold;
  font-size: 16px;
`;

export const ViewSubText = styled.Text`
  color: ${Colors.DARK_LIGHT};
  font-size: 14px;
  margin-top: 5px;
  margin-bottom: 15px;
`;

export const TouchImageDocuments = styled.TouchableOpacity`
  color: ${Colors.WHITE};
  border: 2px;
  border-color: ${Colors.DARK_LIGHT};
  border-radius: 10px;
  width: 100px;
  height: 100px;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
`;

export const ViewSubTextDocument = styled.Text`
  color: ${Colors.DARK_LIGHT};
  font-size: 14px;
  margin-top: 10px;
`;

export const ViewItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
`;

export const TouchImageVehicle = styled.TouchableOpacity`
  align-items: center;
`;

export const ViewSubTextVehicle = styled.Text`
  color: ${Colors.GREY};
  font-size: 14px;
  margin-top: -8px;
`;
