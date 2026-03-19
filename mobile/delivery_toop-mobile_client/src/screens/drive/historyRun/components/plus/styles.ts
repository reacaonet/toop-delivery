import {StyleSheet} from 'react-native';
import {Typography, Colors} from '../../../../../styles';

const styles = StyleSheet.create({
  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5,
  },
  icon: {
    color: Colors.BLACK,
    marginRight: 20,
    marginTop: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    flex: 1,
    width: '75%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ViewHeart: {
    flexDirection: 'row',
  },
  heart: {
    color: Colors.BLACK,
  },
  safeAreaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  container: {
    width: '95%',
    height: 70,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },
  containerMoto: {
    height: 100,
    width: '90%',
    marginTop: 20,
    flexDirection: 'row',
    alignSelf: 'center',
  },

  atribute: {
    flexDirection: 'column',
  },

  name: {
    marginLeft: 10,

    fontSize: Typography.FONT_SIZE_16,
  },

  car: {
    marginLeft: 10,
    marginTop: 10,
    fontSize: Typography.FONT_SIZE_13,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  border: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: Colors.GRAY_LIGHT,
    borderBottomWidth: 4,
    marginTop: 10,
  },
  titleStreet: {
    marginTop: 20,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
    paddingRight: 10,
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
    transform: [{rotate: '180deg'}],
  },

  street: {
    flexDirection: 'row',
  },

  containerTwo: {
    width: '90%',
    height: 60,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  text: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  final: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  avatitle: {
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  avaNumber: {
    marginTop: 12,
    marginLeft: -10,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  avali: {
    marginTop: 10,
    marginRight: 20,
    fontSize: Typography.FONT_SIZE_13,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  ava: {
    flexDirection: 'row',
  },

  title: {
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
    textTransform: 'uppercase',
  },

  title2: {
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  credit: {
    marginTop: 20,
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  creditNumb: {
    marginTop: 20,
    marginLeft: 50,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
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

  image: {
    width: 20,
    height: 20,
    marginTop: 20,
    marginRight: 20,
  },

  line: {
    borderBottomColor: Colors.BLACK,
    borderBottomWidth: 4,
    height: 20,
  },

  route: {
    marginTop: 10,
    width: '8%',
    borderBottomColor: Colors.BLACK,
    borderBottomWidth: 4,
    position: 'relative',
  },

  route2: {
    marginTop: 10,
    width: '81%',
    marginLeft: 5,
    marginRight: 5,
    borderBottomColor: Colors.BLACK,
    borderBottomWidth: 4,
    position: 'relative',
  },

  route3: {
    marginTop: 10,
    width: '8%',

    borderBottomColor: Colors.BLACK,
    borderBottomWidth: 4,
    position: 'relative',
  },

  ball: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    backgroundColor: Colors.BLACK,
    top: 62,
    alignSelf: 'center',
  },

  ball2: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    backgroundColor: Colors.BLACK,
    top: 62,
    marginLeft: 90,
  },

  ball3: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    backgroundColor: Colors.BLACK,
    top: 62,
    marginLeft: 235,
  },

  box: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 10,
  },

  button: {
    flexDirection: 'row',
  },

  linha1: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },

  linha: {
    height: 20,
    marginTop: 10,
    marginLeft: 14.4,
    width: 1,
    backgroundColor: '#909090',
  },

  bola: {
    width: 8,
    height: 8,
    marginLeft: 10,
    marginTop: 10,
    borderRadius: 8 / 2,
    backgroundColor: Colors.BLACK,
  },
});

export default styles;
