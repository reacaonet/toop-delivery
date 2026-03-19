import {StyleSheet} from 'react-native';
import {Colors} from '../../../../src/styles';

const styles = (props: any = {}) =>
  StyleSheet.create({
    formGroup: {
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'center',
      marginTop: 21,

      position: 'relative',
    },
    label: {
      fontFamily: 'Roboto-Light',
      fontSize: 12,
      textAlign: 'left',
      color: Colors.WHITE,
      letterSpacing: 0.5,
      lineHeight: 14,

      marginBottom: 5,
      marginLeft: 5,
    },
    input: {
      paddingHorizontal: 10,

      backgroundColor: Colors.WHITE,

      borderRadius: 5,
      width: '100%',
      height: 55,
    },

    overlayStyle: {
      flex: 1,
      padding: 15,
      paddingBottom: 0,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    cancelStyle: {
      backgroundColor: Colors.BLUE_LIGHT,
      padding: 10,
    },
    cancelTextStyle: {
      color: Colors.WHITE,
      fontFamily: 'Roboto-Light',
      fontSize: 14,
      letterSpacing: 0.5,
      lineHeight: 14,
      textTransform: 'uppercase',
      padding: 10,
    },
    optionContainerStyle: {
      backgroundColor: Colors.WHITE,
      borderBottomColor: Colors.PRIMARY,
      borderBottomWidth: 0.2,
    },
    optionStyle: {padding: 20},
    optionTextStyle: {
      color: Colors.PRIMARY,
      fontFamily: 'Roboto-Regular',
      fontSize: 14,
      letterSpacing: 0.5,
      lineHeight: 14,
    },
    sectionTextStyle: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontFamily: 'Roboto',
      fontSize: 16,
      letterSpacing: 0.5,
      lineHeight: 22,
    },

    inputLabel: {
      fontFamily: 'Roboto-Regular',
      fontSize: 16,
      letterSpacing: 0.5,
      color: Colors.PRIMARY,
      height: 55,

      width: '100%',
    },

    labelError: {
      fontFamily: 'Roboto-Regular',
      fontSize: 12,
      letterSpacing: 0.5,
      lineHeight: 14,
      color: Colors.ALERT,
      marginLeft: 5,
      marginTop: 5,
    },
    icon: {
      marginRight: 5,
      width: 18,
      height: 18,
    },
    item: {
      padding: 20,
      borderBottomColor: Colors.PRIMARY,
      borderBottomWidth: 0.2,
    },
    itemLabel: {
      fontFamily: 'Roboto-Regular',
      fontSize: 14,
      textAlign: 'left',
      color: Colors.PRIMARY,
      letterSpacing: 0.5,
      lineHeight: 14,

      marginBottom: 5,
      marginLeft: 5,
    },
  });

export default styles;
