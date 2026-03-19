import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../../../styles';

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: Colors.WHITE,
  },
  containerOptions: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 15,
    justifyContent: 'center',
    // justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerOptionsPassenger: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    width: '100%',
    justifyContent: 'center',
    // justifyContent: 'space-between',
    alignItems: 'stretch',

    borderTopColor: '#ddd',
    borderTopWidth: 1,
    borderStyle: 'solid',
  },
  waitingOptions: {
    flexDirection: 'row',

    alignSelf: 'center',
  },
  time: {
    position: 'absolute',
    top: 43,

    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#fff',
    zIndex: 9,
    paddingVertical: 5,
    paddingHorizontal: 20,

    borderColor: '#000',
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 25,
    elevation: 5,
    shadowColor: Colors.PRIMARY,
  },

  containerPassenger: {
    flexDirection: 'row',
    borderTopColor: '#aaa',
    borderTopWidth: 1,
    borderStyle: 'solid',

    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,

    paddingTop: 20,
    paddingHorizontal: 15,
  },
  waitingOptionsPassenger: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 15,

    position: 'relative',
  },
  timeDistanceDestiny: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.PRIMARY,
  },
  txtPassengerName: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: Typography.FONT_SIZE_18,
    color: Colors.BLACK,
    alignSelf: 'center',

    flex: 1,
    textAlign: 'center',
  },
  timeDistanceDestinyPassenger: {
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontSize: Typography.FONT_SIZE_18,
    color: Colors.PRIMARY,

    alignSelf: 'center',

    paddingBottom: 10,
    paddingTop: 10,
  },
  sideOption: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    height: 40,
  },
  sideOptionText: {
    fontSize: 9,
    color: Colors.GREY,
  },
  goOnlineButton: {
    width: 165,
    borderRadius: 5,
    paddingVertical: 12,
    marginHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
  },
  goStartButton: {
    flex: 1,
    borderRadius: 5,
    paddingVertical: 12,
    marginHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  goOnlineButtonText: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.WHITE,
    fontSize: 15,
    lineHeight: 16,
    textAlign: 'center',
    // textTransform: 'uppercase',
  },
  goOnButton: {
    backgroundColor: Colors.SUCCESS,
  },
  goOfflineButton: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    backgroundColor: Colors.PRIMARY,
  },
  goOfButton: {
    backgroundColor: Colors.ALERT,
  },
  viewMessage: {
    // marginBottom: 10,
    width: 50,
    height: 50,

    borderRadius: 100,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: 9,
  },
  viewOptions: {
    flex: 1,
    height: 100,
    flexDirection: 'column',
  },
  viewNoOptions: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 45,
  },
  cancelBtn: {
    flex: 1,
    marginTop: 5,
    borderRadius: 5,
    paddingVertical: 12,
    marginHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: Colors.RED,
  },
  noticeText: {
    position: 'absolute',
    top: 0,
    right: 2,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_11,
    color: Colors.WHITE,
    zIndex: 1,
    borderRadius: 10,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  containerMessage: {
    marginRight: 10,
  },
  confirmationCodeContainer: {
    flexDirection: 'column',
    padding: 10,
    alignItems: 'center',
    // justifyContent: 'center',
    justifyContent: 'space-between',
  },
  inputConfirmationCode: {
    color: Colors.BLACK,
    width: '90%',
    padding: 10,
    backgroundColor: Colors.GRAY_LIGHT,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    borderRadius: 5,
    marginBottom: 10,
  },
  contentPassenger: {
    width: '100%',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    // borderBottomWidth: 0.5,
    elevation: 1,
  },
  contentPhone: {
    paddingLeft: 10,
    paddingRight: 5,
    justifyContent: 'flex-end',
  },
  phoneImage: {
    width: 35,
    height: 35,
  },
  chatImage: {
    width: 35,
    height: 35,
  },
  passengerName: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.BLACK,
    flex: 1,
  },
  passengerPhone: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.BLACK,
  },
});

export default styles;
