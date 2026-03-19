import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  map: {
    marginHorizontal: 20,
    minHeight: 170,
    borderRadius: 5,
    overflow: 'hidden',
  },
  rideView: {
    flex: 1,
  },
  rideInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  price: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_20,
    color: Colors.BLACK,
  },
  ride: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_16,
    marginVertical: 5,
  },
  duration: {
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontSize: Typography.FONT_SIZE_12,
  },
  confirmButtonContainer: {
    backgroundColor: Colors.WHITE,
    padding: 20,
  },
  confirmButton: {
    backgroundColor: Colors.BLACK,
    borderRadius: 7,
    paddingVertical: 13,
  },
  confirmButtonText: {
    textAlign: 'center',
    fontSize: 15,
    color: Colors.WHITE,
  },
  companyContainer: {
    flex: 1,
  },
  company: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  companyInfo: {
    flex: 1,
    marginHorizontal: 20,
  },
  name: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_15,
    marginBottom: 4,
  },
  description: {
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontSize: Typography.FONT_SIZE_12,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  left: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  right: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  deselected: {
    backgroundColor: Colors.SECONDARY,
  },
  selected: {
    backgroundColor: Colors.PRIMARY,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  creditCardNumber: {
    flex: 1,
    marginHorizontal: 20,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_15,
  },
  changeText: {
    fontSize: Typography.FONT_SIZE_13,
    color: Colors.PRIMARY,
  },
  useWalletBallanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: Colors.WHITE,
  },
  walletBallance: {
    flex: 1,
    marginHorizontal: 10,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  useWallet: {
    backgroundColor: Colors.SECONDARY,
  },
  dontUseWallet: {
    borderWidth: 1,
    borderColor: Colors.GREY,
    backgroundColor: Colors.WHITE,
  },
  collaboratorField: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collaboratorLabel: {
    flex: 1,
    marginHorizontal: 10,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_13,
    color: Colors.GREY,
  },
  collaboratorName: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.PRIMARY,
  },
  moneyIcon: {
    width: 21,
    height: 15,
  },
});

export default styles;
