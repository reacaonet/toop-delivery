import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../../../styles';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    elevation: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  money: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    elevation: 0,
    backgroundColor: Colors.WHITE,
    justifyContent: 'center',
  },
  dayText: {
    color: Colors.BLACK,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_11,
  },
  moneyText: {
    color: Colors.BLACK,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_22,
  },
  addressDestination: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20,
    elevation: 3,
  },
  txtAddress: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.WHITE,
  },
  txtTime: {
    color: Colors.WHITE,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_15,
    width: '100%',
    marginLeft: 10,
    marginTop: 10,
  },
});

export default styles;
