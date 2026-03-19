import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../../styles';

const styles = StyleSheet.create({
  address: {
    marginRight: 19,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeIcon: {
    color: Colors.PRIMARY,
  },
  disabled: {
    color: Colors.GRAY_DARK,
  },
  txtAddress: {
    width: '100%',
    flexShrink: 1,
    marginRight: 5,
    textAlign: 'right',
    color: Colors.DARK,
    textTransform: 'uppercase',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
  },
  container: {
    width: 250,
    flexShrink: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  ButtonImage: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 22
  },

  ButtonBoard: {
    width:'80%',
    height: 25,
    borderRadius:8,
    marginRight: 15,
    justifyContent: 'center',
    backgroundColor: '#992427'
  },

  TextButton: {
    color: '#ffff',
    fontSize: 12,
    textAlign: 'center',
    width:'100%'
  },

  imageIcon: {
    width: 24,
    height: 24
  }




});

export default styles;
