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
    props.paymentType === 'BRASPAG' ? Colors.WHITE : Colors.PRIMARY_LIGHT};
`;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  flatStyle: {
    flex: 1,
  },
  txtHistory: {
    marginLeft: 2,
    fontSize: 16,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  bellLoad: {
    width: 17,
    height: 22,
    color: Colors.PRIMARY,
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
});
