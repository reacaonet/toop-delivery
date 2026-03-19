import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    zIndex: 9999,
  },
  cardPerson: {
    flexDirection: 'row',
    backgroundColor: '#CCC',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 20,
  },
  iconPersonContainer: {
    marginBottom: 5,
    width: 55,
    height: 55,
  },
  txtType: {
    fontSize: 18,
    color: Colors.PRIMARY,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    marginLeft: 10,
  },
  txtPerson: {
    fontSize: 15,
    color: Colors.WHITE,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    marginLeft: 10,
  },
  flatStyle: {
    marginTop: 10,
    flex: 1,
    backgroundColor: Colors.WHITE,
    marginBottom: 5,
  },
  containerMessage: {
    backgroundColor: Colors.GREY,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    marginLeft: 50,
  },
  containerMessageReceive: {
    backgroundColor: Colors.PRIMARY,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    marginRight: 50,
  },
  txtMessage: {
    fontSize: 14,
    color: Colors.WHITE,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  inputMessage: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  inputCheckout: {
    flex: 1,
    marginLeft: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.PRIMARY,
    marginBottom: 5,
    backgroundColor: Colors.PRIMARY_LIGHT,
  },
  sendIcon: {
    color: Colors.PRIMARY,
    marginHorizontal: 10,
  },
  textAlertContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  textAlert: {
    color: Colors.ALERT,
    fontSize: 16,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
});

export default styles;
