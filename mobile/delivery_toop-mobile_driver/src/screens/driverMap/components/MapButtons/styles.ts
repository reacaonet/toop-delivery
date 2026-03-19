import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography } from '../../../../styles/index';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100 + 20,
    right: 20,
  },
  circleBtn: {
    width: 50,
    height: 50,
    backgroundColor: Colors.WHITE,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 5,
  },
  modalStyle: {
    backgroundColor: 'transparent',
    marginTop: Dimensions.get('window').height * 0.55,
    marginLeft: 15,
    marginRight: 15,
    elevation: 0,
  },
  modalOverlayStyle: {
    backgroundColor: 'transparent',
  },
  modalChildrenStyle: {
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.25,
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    elevation: 2,
  },
  titleNavigation: {
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.BLACK,
    textAlign: 'center',
    marginTop: 10,
  },
  containerApp: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  nameApp: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: Colors.BLACK,
  },
  contentImg: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  imgIcon: {
    width: 70,
    height: 70,
  },
});

export default styles;
