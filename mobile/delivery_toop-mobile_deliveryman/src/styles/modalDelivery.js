import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../styles';

const ModalDelivery = StyleSheet.create({
  Blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxDelivery: {
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    width: '75%',
    padding: 20,
    elevation: 5,
  },
  CountDown: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: Colors.PRIMARY,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  CountDownText: {
    color: '#fff',
    fontSize: 17,
  },
  Title: {
    color: '#b2b1b2',
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: 16,
  },
  boxInfoDelivery: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#ff0',
    marginVertical: 20,
    overflow: 'hidden',
  },
  boxInfoDeliveryImage: {},
  boxInfoDeliveryBlur: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxInfoDeliveryCompanyImage: {
    width: 70,
    height: 70,
  },
  boxInfoDeliveryTitle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: 17,
    color: '#545153',
  },
  boxInfoDeliveryAddress: {
    textAlign: 'center',
    fontFamily: Typography.FONT_FAMILY_BOLD,
    color: '#7a787b',
  },
  ButtonAccept: {
    borderRadius: 5,
    paddingHorizontal: 25,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  ButtonAcceptText: {
    color: '#fff',
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: 16,
  },
  ButtonReject: {
    backgroundColor: '#eeedee',
    paddingHorizontal: 25,
    paddingVertical: 7,
    borderRadius: 5,
    marginTop: 10,
  },
  ButtonRejectText: {
    color: '#b2b1b2',
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
});

export default ModalDelivery;
