import {StyleSheet, StatusBar} from 'react-native';
import {Colors, Typography} from '../../../../../styles';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: StatusBar.currentHeight + 15,
    // top: 5,
    width: '100%',
    flexDirection: 'row',
  },
  menuButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 7,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    backgroundColor: Colors.WHITE,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: Typography.FONT_SIZE_16,
  },
});

export default styles;
