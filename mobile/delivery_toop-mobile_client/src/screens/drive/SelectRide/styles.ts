import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  map: {
    flex: 1,
    marginHorizontal: 20,
    minHeight: 220,
  },
  title: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.PRIMARY,
    paddingTop: 20,
  },
  titleDriver: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    textAlign: 'center',
    fontSize: 14,
    color: Colors.SECONDARY,
  },
  requestRideButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 7,
    paddingVertical: 13,
    margin: 20,
  },
  requestRideButtonText: {
    textAlign: 'center',
    fontSize: 15,
    color: Colors.WHITE,
  },
  header: {
    height: 56,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});

export default styles;
