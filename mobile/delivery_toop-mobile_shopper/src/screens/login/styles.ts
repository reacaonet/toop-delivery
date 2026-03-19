import {StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {KeyboardAvoidingView as genericKeyboardAvoidingView} from 'react-native';
import {Colors, Typography} from '../../styles';

export const Container = styled.ScrollView.attrs({
  contentContainerStyle: {
    justifyContent: 'center',
    alignItems: 'stretch',
    flexGrow: 1,
    paddingHorizontal: 0,
    background: Colors.WHITE,
  },
})`
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

export const LogoWrapper = styled.View`
  justify-content: center;
  align-items: center;
  background-color: #992326;
  flex: 1;
`;

export const Logo = styled.Image.attrs({
  // resizeMode: 'contain',
})`
  width: 80%;
  height: 100px;
`;

export const Row = styled.View`
  flex-direction: row;
`;

export const ButtonWrapper = styled.View`
  margin-top: 20px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

export const styles = StyleSheet.create({
  txt: {
    marginTop: 90,
    color: Colors.DARK_LIGHT,
    fontSize: Typography.FONT_SIZE_16,
  },
  txtClick: {
    marginTop: 10,
    color: Colors.PRIMARY_LIGHT,
    fontSize: Typography.FONT_SIZE_12,
  },
  container: {
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    color: Colors.GREY,
    fontSize: Typography.FONT_SIZE_14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 0.5,
    borderStyle: 'solid',
    borderRadius: 8,
    backgroundColor: Colors.INPUT,
    borderColor: Colors.GREY,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 40,
  },
});
export const RowVersion = styled.SafeAreaView`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.BACKGROUND};
`;

export const TextVersion = styled.Text`
  font-size: 14px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;
