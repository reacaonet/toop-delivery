import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../../../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  headerContainer: {
    flex: 1,
  },
  content: {
    flex: 7,
    backgroundColor: Colors.WHITE,
  },
  cardSearch: {
    //marginHorizontal: 20,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: Colors.WHITE,
    //borderRadius: 30,
    //borderWidth: 1,
    //borderColor: Colors.GREY,
    //borderStyle: 'solid',
    flex: 1,
  },
  close: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  footerContainer: {
    flex: 1,
  },
  cardItem: {
    flex: 1,
    marginTop: 20,
  },
  flatStyle: {
    flex: 1,
  },
  flatRender: {
    flexDirection: 'row',
  },
  ImageProduct: {
    width: 100,
    height: 100,
  },
  txtInfo: {
    flex: 1,
    //backgroundColor: 'orange',
  },
  txtFlatProduct: {
    marginLeft: 5,
    fontSize: Typography.FONT_SIZE_14,
    fontWeight: '800',
  },
  txtFlatPrice: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  confirmOptions: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 15,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.SUCCESS,
    borderRadius: 20,
    padding: 5,
    marginHorizontal: 20,
  },
  txtConfirmBtn: {
    color: Colors.WHITE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputAmount: {
    height: 30,
    width: 100,
    padding: 0,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_16,
    textAlign: 'center',
    borderColor: Colors.PRIMARY_DARK,
    borderBottomWidth: 1,
  },
  containerProduct: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
