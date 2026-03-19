import {StyleSheet, Dimensions} from 'react-native';
import {Colors, Typography} from '../../../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginRight: 20,
  },
  Flatlist: {
    paddingLeft: 0,
  },
  BoxFilter: {
    marginTop: 10,
    marginRight: 10,
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Slide: {
    width: 95,
    height: 80,
    borderRadius: 10,
  },
  imgGrey: {
    opacity: 0.3,
  },
  FilterText: {
    color: Colors.GREY,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_14,
    marginTop: 5,
  },
});

export default styles;
