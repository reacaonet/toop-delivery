import {StyleSheet} from 'react-native';
import {Colors, Typography} from '../../../../../styles';

const styles = (props: any = {}) =>
  StyleSheet.create({
    formGroup: {
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'center',

      position: 'relative',
      width: '90%',
      color: Colors.GREY,
      fontSize: Typography.FONT_SIZE_14,
      fontFamily: Typography.FONT_FAMILY_BOLD,

      borderRadius: 10,
      marginTop: 20,

      borderColor: Colors.GRAY_LIGHT,
      borderWidth: 1,

      backgroundColor: Colors.GRAY_LIGHT,
      height: 60,
    },
    label: {
      fontSize: 12,
      textAlign: 'left',
      color: Colors.GRAY,
      letterSpacing: 0.5,
      lineHeight: 14,

      marginBottom: 5,
      marginLeft: 5,
    },
    input: {
      paddingHorizontal: 10,

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
      fontSize: 14,
      letterSpacing: 0.5,
      lineHeight: 14,
    },
    sectionTextStyle: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: 16,
      letterSpacing: 0.5,
      lineHeight: 22,
    },

    inputLabel: {
      fontSize: 16,
      letterSpacing: 0.5,
      color: Colors.PRIMARY,
      height: 55,

      width: '100%',
    },

    labelError: {
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
