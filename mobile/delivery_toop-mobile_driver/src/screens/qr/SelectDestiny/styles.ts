import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../styles';
import styled from 'styled-components/native';

export const HeaderGoBack = styled(TouchableOpacity).attrs({
  backgroundColor: Colors.BLACK,
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderTopRightRadius: 5,
  borderBottomRightRadius: 5,
})`
  margin-bottom: 10px;
  margin-left: 29px;
  margin-top: 10px;
`;

export const Header = styled.View`
  flex-direction: row;
  background-color: ${Colors.WHITE};
  margin-left: 5px;
`;

export const HeaderBackTouch = styled.TouchableOpacity`
  padding: 5px;
`;

export const IconBack = styled(Icon)``;

const styles = StyleSheet.create({
  SafeAreaContent: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingTop: 24,
  },
  destinyFields: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 13,
    borderBottomColor: Colors.GREY_BACKGROUND,
    borderBottomWidth: 4,
  },
  lateral: {
    top: 25,
    height: 100,
  },
  viewAddStop: {
    flexDirection: 'row',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAddStop2: {
    flexDirection: 'row',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fields: {
    flex: 1,
    height: '100%',
    marginHorizontal: 14,
  },
  viewCurrentLocation: {
    flexDirection: 'row',
  },
  inputField: {
    backgroundColor: Colors.GREY_BACKGROUND,
    borderRadius: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    fontSize: 13,
  },
  marginBottom7: {
    marginBottom: 7,
  },
  origin: {
    color: Colors.PRIMARY,
  },
  plusButton: {
    padding: 5,
    borderRadius: 40,
    backgroundColor: Colors.GREY_BACKGROUND,
  },
  options: {},
});

export default styles;
