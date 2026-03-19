import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../../../styles';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginLeft: 15,
    marginRight: 15,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 0.3,
    borderColor: Colors.GRAY_DARK,
    elevation: 3,
    backgroundColor: Colors.WHITE,
    borderRadius: 4,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titileTabs: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    color: Colors.GRAY_DARK,
  },
  titleSelected: {
    color: Colors.PRIMARY,
    // borderBottomWidth: 1,
    // borderColor: Colors.PRIMARY,
  },
});

export default styles;
