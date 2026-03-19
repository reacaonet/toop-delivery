import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.WHITE,
    marginBottom: 5,
  },
  buttonContent: {
    marginHorizontal: 20,
  },
  txt: {
    color: Colors.GREY,
    fontSize: Typography.FONT_SIZE_15,
    marginBottom: 8,
  },
  txtBlue: {
    color: Colors.PRIMARY,
    fontSize: Typography.FONT_SIZE_15,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: 0,
    marginHorizontal: 20,
    marginBottom: 60,
  },
  cardContainer: {
    //borderWidth: 0.3,
    //padding: 10,
    marginBottom: 40,
  },
  marginTop: {
    marginTop: 20,
  },
  marginBottom: {
    marginBottom: 20,
  },
  cartItemContainer: {
    marginVertical: 5,
    borderColor: Colors.GREY,
    elevation: 3,
    backgroundColor: Colors.WHITE,
    borderStyle: 'solid',
    borderRadius: 8,
    padding: 6,
  },
  cartItemProduct: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  productIcon: {
    marginRight: 5,
  },
  productContainer: {
    flexDirection: 'row',
  },
  productImageContainer: {},
  productImage: {
    width: 60,
    height: 60,
  },
  productInfo: {
    flex: 1,
    //backgroundColor: 'orange',
    marginLeft: 10,
    justifyContent: 'center',
  },
  iconAlert: {
    color: Colors.ALERT,
  },
  txtComplement: {
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_14,
  },
  cardImage: {
    flexDirection: 'row',
    backgroundColor: Colors.PRIMARY,
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 5,
    borderRadius: 30,
    alignItems: 'center',
  },
  cardUser: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  cardUserInfo: {},
  cardUserTitle: {
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginLeft: 10,
  },
  iconMessage: {
    marginTop: -10,
    zIndex: 5,
  },
  iconCartMessage: {
    color: Colors.WHITE,
  },
  contentBadgeMessage: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  badgeMessage: {
    backgroundColor: Colors.PRIMARY_DARK,
    borderRadius: 30,
    textAlign: 'center',
    color: Colors.WHITE,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    width: 20,
    height: 20,
  },
  containerStatus: {
    marginVertical: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.PRIMARY,
    padding: 5,
    marginBottom: 10,
  },
  viewNumberOrder: {
    flexDirection: 'row',
    width: '100%',
  },
  viewInfo50: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewInfoText: {
    flexDirection: 'row',
    flex: 1,
  },
  txtTitleOrder: {
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
  },
  txtNumberOrder: {
    color: Colors.PRIMARY,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
  },
  txtOrder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  listOrderTxt: {
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.GREY,
    fontWeight: 'bold',
  },
  listOrderQtd: {
    fontSize: Typography.FONT_SIZE_14,
    fontWeight: 'bold',
  },
  finalized: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Colors.WHITE,
  },
  itensTxt: {
    textAlign: 'center',
    fontSize: Typography.FONT_SIZE_15,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    paddingVertical: 10,
  },
  viewInformation: {
    borderRadius: 5,
    backgroundColor: Colors.WHITE,
    elevation: 3,
    marginTop: 5,
    padding: 5,
    paddingHorizontal: 10,
  },
  txtTouchComplent: {
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.PRIMARY,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontStyle: 'italic',
  },
  productName: {
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.GREY,
  },
  productPrice: {
    fontSize: Typography.FONT_SIZE_15,
    color: Colors.BLUE_LIGHT,
  },
});

export default styles;
