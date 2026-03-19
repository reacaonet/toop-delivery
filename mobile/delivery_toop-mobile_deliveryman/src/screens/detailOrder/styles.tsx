import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  content: {
    flex: 1,
    margin: 20,
  },
  flatStyle: {
    flex: 1,
    marginBottom: 120,
  },
  cartItemContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.GREY,
    borderStyle: 'solid',
    borderRadius: 10,
    padding: 10,
  },
  cartItemProduct: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  productIcon: {
    marginRight: 10,
  },
  productImageContainer: {},
  productImage: {
    width: 80,
    height: 80,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  productIconRemove: {
    color: Colors.ALERT,
  },
  imageContainer: {
    width: 80,
    height: 80,
  },
  imageProduct: {
    width: 80,
    height: 80,
  },
  txtNameProd: {
    flex: 5,
    marginLeft: 5,
    fontSize: 14,
    color: Colors.GREY,
  },
  txtPrice: {
    flex: 2,
    marginLeft: 2,
    fontSize: 16,
    color: Colors.GREY,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  divider: {
    borderWidth: 0.5,
    borderColor: Colors.GREY,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  optionsFlatList: {
    flexDirection: 'row',
    marginHorizontal: 20,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.PRIMARY_DARK,
    borderRadius: 20,
    padding: 5,
  },
  removeBtn: {
    flex: 1,
    backgroundColor: Colors.SECONDARY_DARK,
    borderRadius: 20,
    padding: 5,
  },
  txtRemove: {
    color: Colors.WHITE,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    textAlign: 'center',
  },
  containerBottom: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: Colors.WHITE,
    marginBottom: 0,
    borderWidth: 0.5,
    borderColor: Colors.PRIMARY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  addProduct: {
    marginTop: -25,
  },
  addProductIcon: {
    color: Colors.PRIMARY,
  },
  bottonAddContent: {
    width: '90%',
  },
  spacingHorizontal: {
    marginHorizontal: 10,
  },
  check: {
    color: Colors.SUCCESS,
  },
  checkContainer: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  listSub: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  subTitle: {
    flex: 2,
    fontSize: 15,
    fontFamily: 'Roboto',
    color: Colors.GREY,
  },
  subPrice: {
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
    fontFamily: 'Roboto',
  },
  txtBold: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
});

export default styles;
