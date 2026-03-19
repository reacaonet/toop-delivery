import {StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {Colors, Typography} from '../../styles';

export const HistoryItem = styled.TouchableOpacity`
  background-color: ${(props: any) =>
    props.paymentType === 'BRASPAG' ? Colors.PRIMARY_LIGHT : Colors.WHITE};
  border-color: ${(props: any) =>
    props.paymentType === 'BRASPAG' ? Colors.PRIMARY_LIGHT : Colors.WHITE};
`;

export const TextHistory = styled.Text`
  color: ${(props: any) =>
    props.paymentType === 'BRASPAG' ? Colors.WHITE : Colors.GREY};
`;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    justifyContent: 'space-around',
  },
  m15: {
    margin: 15,
  },
  row: {
    flexDirection: 'row',
  },
  txtHistory: {
    marginLeft: 2,
    fontSize: 16,
  },
  bellLoad: {
    width: 17,
    height: 22,
    color: Colors.PRIMARY_LIGHT,
  },
  txtCenter: {
    textAlign: 'center',
  },
  txtBold: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  txtCash: {
    color: Colors.SUCCESS,
  },
  txtWhiteBold: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: Colors.WHITE,
    fontSize: 19,
  },
  txtTitleGray: {
    color: Colors.GREY,
    fontSize: 18,
  },
  txtHourBlue: {
    color: Colors.PRIMARY_LIGHT,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    margin: 15,
    fontSize: 20,
  },
  historyItem: {
    borderRadius: 18,
    borderWidth: 1,
    elevation: 5,
    shadowOpacity: 1,
    shadowColor: Colors.GREY,
    margin: 10,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerDetail: {
    position: 'absolute',
    width: '100%',
    height: 70,
    left: 0,
    bottom: 0,
    margin: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY_LIGHT,
  },
});
