import { StyleSheet } from 'react-native';
import { Typography, Colors } from '../../../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  containerLoad: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  BoxInfo: {
    flex: 1,
    // padding: 19,
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    textAlign: 'center',
    marginTop: 30,
  },
  viewMap: {
    width: '100%',
  },
  map: {
    width: '100%',
    marginVertical: 20,
  },
  titleLocation: {
    fontSize: 24,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    textAlign: 'center',
    marginBottom: 15,
  },
  BoxSubTitleLocation: {
    // alignItems: 'center'
  },
  SubTitleLocation: {
    borderColor: Colors.PRIMARY,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    marginHorizontal: 20,
    textAlign: 'justify',
    lineHeight: 20,
  },
  BoxFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    flexShrink: 1,
    marginHorizontal: 10,
    marginBottom: 19,
    borderRadius: 7,
    paddingVertical: 12,
  },
  btnPrimary: {
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.PRIMARY,
  },
  btnText: {
    fontSize: 16,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    color: Colors.PRIMARY,
  },
  btnTextPrimary: {
    color: Colors.WHITE,
    fontWeight: 'bold',
  },
  loader: {
    justifyContent: 'center',
  },
});

export default styles;
