import {StyleSheet, Dimensions} from 'react-native';
import {Colors, Typography} from '../../../styles';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    textAlign: 'center',
    marginTop: 30,
  },
  viewMap: {
    flex: 1,
    height: Dimensions.get('window').height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    height: '90%',
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
  },
  viewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 10,
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
