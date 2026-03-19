import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../../styles';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.WHITE,
    marginBottom: 5,
  },
  tabBarStyle: {
    backgroundColor: 'transparent',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#e8e6e8',
    elevation: 0,
  },
  tabBarLabel: {
    alignItems: 'center',
  },
  tabBarLabelStyle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  tabBarIndicatorStyle: {
    backgroundColor: 'transparent',
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#e8e6e8',
    height: '100%',
  },
  boxOrder: {
    padding: 10,
  },
  boxOrderTitle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: 15,
    lineHeight: 25,
    color: Colors.PRIMARY_DARK,
  },
  boxOrderText: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: 15,
    lineHeight: 25,
    color: '#a6a5a7',
  },
  boxShopper: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 60,
    margin: 10,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boxShopperInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxShopperImg: {
    width: 60,
    height: 60,
    borderRadius: 60,
    marginRight: 10,
  },
  textShopper: {
    color: '#fff',
    fontSize: 12,
  },
  textShopperName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  boxShopperIcon: {
    color: '#fff',
    marginHorizontal: 15,
  },
  startDelivery: {
    backgroundColor: Colors.PRIMARY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
    alignSelf: 'center',
  },
  startDeliveryDisabled: {
    backgroundColor: Colors.GREY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
    alignSelf: 'center',
  },
  startDeliveryText: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
  },
  startDeliveryInfo: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_10,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
  },
  finalized: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Colors.WHITE,
  },
  content: {
    flex: 1,
    marginTop: 5,
    marginHorizontal: 20,
    marginBottom: 60,
  },
  maps: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  routeMap: {
    marginBottom: 20,
    height: 70,
    width: 70,
  },
  txtMap: {
    marginLeft: 15,
    // fontFamily: Typography.FONT_FAMILY_BOLD,
    fontSize: 15,
    lineHeight: 25,
    color: Colors.PRIMARY_DARK,
  },
  containerGeral: {
    flex: 1,
    backgroundColor: Colors.WHITE,
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
  iconMessage: {
    marginTop: -10,
    zIndex: 5,
  },
  cartTitle: {
    fontSize: Typography.FONT_SIZE_14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cartContainer: {
    marginTop: 10,
    backgroundColor: Colors.WHITE,
    padding: 5,
    marginHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    elevation: 3,
    borderRadius: 10,
  },
  imageContainer: {
    width: 50,
    height: 50,
  },
  imageProduct: {
    width: 50,
    height: 50,
  },
  txtNameProd: {
    marginBottom: 5,
    // marginLeft: 5,
    fontSize: Typography.FONT_SIZE_14,
    color: '#555555',
    fontFamily: Typography.FONT_FAMILY_REGULAR,
  },
  titleComplement: {
    color: Colors.PRIMARY,
    //marginLeft: 5,
  },
  txtNameProdAlone: {
    marginRight: 15,
    fontSize: Typography.FONT_SIZE_14,
    color: '#555555',
    marginLeft: 5,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    // flex: 5,
  },
});

export default styles;
