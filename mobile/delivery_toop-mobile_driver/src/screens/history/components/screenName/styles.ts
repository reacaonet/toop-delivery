import { StyleSheet } from 'react-native';
import { Typography, Colors } from '../../../../styles';

const styles = StyleSheet.create({
  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5,
  },
  icon: {
    color: Colors.GRAY_TEXT,
    marginLeft: 15,
  },
  safeAreaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  container: {
    width: '90%',
    height: 125,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  containerTwo: {
    width: '90%',
    height: 250,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  scroll: {
    flexGrow: 0.05,
    backgroundColor: 'red',
  },

  text: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  title2: {
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  km: {
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  borderLine: {
    width: '90%',
    marginTop: 20,
    alignSelf: 'center',
    borderColor: Colors.WHITE,
    borderWidth: 1,
  },

  subTitle: {
    marginTop: 5,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  titleStreet: {
    marginTop: 20,
    marginRight: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },
  line: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },
  triangulo: {
    marginLeft: 10,
    marginTop: 30,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.BLACK,
    borderLeftColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },

  route: {
    height: 20,
    marginTop: 10,
    marginLeft: 14.4,
    width: 1,
    backgroundColor: '#909090',
  },

  ball: {
    width: 8,
    height: 8,
    marginLeft: 10,
    marginTop: 10,
    borderRadius: 8 / 2,
    backgroundColor: Colors.BLACK,
  },

  street: {
    flexDirection: 'row',
  },

  box: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 10,
  },

  button: {
    flexDirection: 'row',
  },

  day: {
    color: Colors.BLACK,
    width: '85%',
    alignItems: 'center',
  },

  iconNext: {
    color: Colors.BLACK,
    marginRight: 5,
  },

  balance: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
  },

  containGain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default styles;
