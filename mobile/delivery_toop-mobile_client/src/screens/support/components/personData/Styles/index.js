import {StyleSheet, Platform} from 'react-native';
import styled from 'styled-components/native';
import {Colors, Typography} from '../../../../../styles';

export const styles = StyleSheet.create({
  input: {
    marginTop: 15,
    color: Colors.BLACK,
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    marginBottom: 10,
  },
  boxPhone: {
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    borderRadius: 5,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    height: 65,
  },
  buttonStyle: {
    width: 85,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  rowTextStyle: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_13,
  },
  buttonTextStyle: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: Typography.FONT_SIZE_14,
  },
  txtPhone: {
    color: Colors.BLACK,
    fontSize: Typography.FONT_SIZE_16,
  },
});

export const ViewBody = styled.View.attrs({marginHorizontal: 20})`
  margin-top: 20px;
`;

export const TextInput = styled.Text`
  color: ${Colors.DARK};
  font-size: ${Typography.FONT_SIZE_12 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
`;

export const ViewInput = styled.View`
  border-bottom-width: 0.3px;
  border-bottom-color: ${Colors.GRAY_DARK};
  margin-bottom: 20px;
`;

export const Input = styled.TextInput`
  margin-top: 15px;
  color: ${Colors.BLACK};
  font-size: ${Typography.FONT_SIZE_17 + 'px'};
  font-family: ${Typography.FONT_FAMILY_REGULAR};
  margin-bottom: 10px;
`;
