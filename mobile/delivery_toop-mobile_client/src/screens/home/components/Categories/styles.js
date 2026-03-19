import {StyleSheet, Dimensions} from 'react-native';
import {Colors, Typography} from '../../../../styles/index';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  content: {
    // flex: 1,
    // backgroundColor: 'orange',
  },
  boxCategories: {
    width: '30%',
    marginRight: 8,
  },
  image: {
    width: '100%',
    height: 70,
    marginBottom: 7,
    borderRadius: 7,
  },
  text: {
    textAlign: 'center',
    color: Colors.GRAY_DARK,
    fontSize: Typography.FONT_SIZE_12,
  },
  txtTitle: {
    color: Colors.GRAY_DARK,
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: Typography.FONT_SIZE_16,
    marginVertical: 12,
    letterSpacing: 1,
  },
  Flatlist: {
    paddingLeft: 0,
  },
  BoxFilter: {
    marginTop: 3,
    marginRight: 10,
    width: Dimensions.get('screen').width / 3,
    alignItems: 'center',
  },
  Slide: {
    width: '100%',
    height: 75,
    borderRadius: 10,
  },
  FilterText: {
    color: Colors.GREY,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_14,
    marginTop: 5,
  },
});

export default styles;
