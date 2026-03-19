import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../styles';

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
  container: {
    width: 120,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  imgContent: {
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'orange',
  },
  logo: {
    width: 60,
    height: 60,
  },
  newOrderColor: {
    backgroundColor: Colors.SUCCESS,
  },
});

export default styles;
