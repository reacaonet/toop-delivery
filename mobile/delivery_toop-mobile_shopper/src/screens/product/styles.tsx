import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../styles';

const styles = StyleSheet.create({
  scroolContainer: {
    flexGrow: 1,
    margin: 20,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  barcodeContent: {
    flexDirection: 'row',
  },
  barcode: {
    flex: 3,
  },
  barcodeIcon: {
    flex: 1,
    alignItems: 'center',
  },
  addProduct: {
    flexDirection: 'row',
    borderRadius: 10,
    borderColor: Colors.PRIMARY,
    borderWidth: 0.6,
    //backgroundColor: 'orange',
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  btQtd: {},
  txtQtd: {
    textAlign: 'center',
    fontSize: Typography.FONT_SIZE_16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  preview: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  btnSearchCodeContainer: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    marginTop: -10,
    marginBottom: 20,
    padding: 6,
  },
  btnSearchCodeTxt: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.WHITE,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 0.5,
    borderStyle: 'solid',
    borderRadius: 10,
    borderColor: Colors.GREY,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default styles;
