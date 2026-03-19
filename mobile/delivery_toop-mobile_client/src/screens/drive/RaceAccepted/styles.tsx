import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography } from '../../../styles';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  modalContaienr: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  modalGrabber: {
    width: 50,
    height: 2,
    backgroundColor: Colors.SECONDARY,
    position: 'absolute',
    top: 10,
    left: Dimensions.get('window').width / 2 - 25,
  },
  driverInfoContainer: {
    flex: 1,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverPhoto: {
    width: 62,
    height: 62,
    borderRadius: 5,
  },
  driverInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  plate: {
    fontSize: Typography.FONT_SIZE_16,
  },
  carBrand: {
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontSize: Typography.FONT_SIZE_14,
    marginVertical: 1,
  },
  contentPhone: {
    paddingLeft: 5,
  },
  phoneImage: {
    width: 35,
    height: 35,
  },
  chatImage: {
    width: 35,
    height: 35,
  },
  driverScoreAndName: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontSize: Typography.FONT_SIZE_14,
  },
  timeLeftContainer: {
    width: 62,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderColor: Colors.BLACK,
    borderWidth: 1,
  },
  time: {
    fontSize: Typography.FONT_SIZE_30,
    color: Colors.BLACK,
  },
  timeLabel: {
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.BLACK,
  },
  messageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.BLACK,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  messageText: {
    flex: 1,
    color: Colors.WHITE,
    marginHorizontal: 10,
  },
  newMessagesCount: {
    color: Colors.WHITE,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  fieldLabel: {
    color: Colors.BLACK,
    marginLeft: 10,
  },
  infoButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: Colors.GREY_BACKGROUND,
    marginTop: 10,
    marginBottom: 10,
  },
  infoButtonValue: {
    flex: 1,
    fontSize: Typography.FONT_SIZE_13,
  },
  infoButtonLabel: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: Typography.FONT_SIZE_12,
    color: Colors.BLACK,
    marginLeft: 5,
  },
  banner: {
    width: '100%',
    height: 94,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.BLACK,
    borderRadius: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  primaryButtonText: {
    textAlign: 'center',
    color: Colors.WHITE,
    fontFamily: Typography.FONT_FAMILY_BLACK,
    fontSize: Typography.FONT_SIZE_14,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.GREY_BACKGROUND,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: Colors.ALERT,
    fontSize: Typography.FONT_SIZE_14,
  },
  modalStyles: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 4,
  },
  modalOverlay: {
    backgroundColor: 'transparent',
  },
  timeDistanceDestinyPassenger: {
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.PRIMARY,
    alignSelf: 'center',
    paddingBottom: 10,
    paddingTop: 10,
    marginBottom: 10,
  },
  timeView: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderColor: Colors.BLACK,
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 25,
    elevation: 5,
    shadowColor: Colors.PRIMARY,
    marginTop: -18,
  },
  line: {
    flexDirection: 'row',
    borderTopColor: '#aaa',
    borderTopWidth: 1,
    borderStyle: 'solid',
    zIndex: 9,
  },
  viewSpace: {
    backgroundColor: Colors.WHITE,
    width: '100%',
    height: 100,
  },
  timeDistanceDestiny: {
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.BLACK,
    alignSelf: 'center',
  },
  block: {
    flex: 1,
    height: 100,
  },
});

export default styles;
