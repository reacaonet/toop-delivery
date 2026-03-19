import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../../../styles';

const styles = StyleSheet.create({
  container: {
    marginRight: 20,
    flexDirection: 'row',
    paddingVertical: 10,
  },
  flatItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.GRAY_LIGHT,
    marginRight: 5,
    borderRadius: 5,
  },
  itemSelect: {
    backgroundColor: Colors.GRAY_MAX_DARK,
  },
  flatTitle: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.GRAY,
  },
});

export default styles;
