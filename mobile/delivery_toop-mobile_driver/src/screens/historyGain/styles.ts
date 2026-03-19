import {StyleSheet} from 'react-native'
import { Typography, Colors } from '../../styles';

const styles = StyleSheet.create({
    iconGoBack: {
      color: Colors.BLACK,
      marginLeft: 5
    },
    iconBack: {
      color: Colors.TEXT,
      marginLeft: 10
    },
    day: {
      color: Colors.BLACK,
      width: '80%',
      marginLeft: '20%',
      alignItems: 'center'
    },
    safeAreaView: {
      flexDirection:'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    container: {
      width: '90%',
      height: 125,
      borderRadius: 8,
      marginTop: 10,
      backgroundColor:Colors.GRADIENTE_GREY_BOX,
      alignSelf:'center'
    },
    borderLine: {
      width: '90%',
      marginTop: 20,
      alignSelf: 'center',
      borderColor: Colors.WHITE,
      borderWidth: 1
    },
    containerOne: {
      height: 80,
      backgroundColor:Colors.GRADIENTE_GREY_BOX,
      flexDirection: 'row',
      justifyContent:'space-between'
    },
    containTwo: {
      width: '100%',
      height: 80,
      backgroundColor:Colors.WHITE,
      flexDirection: 'row',
      justifyContent:'space-between'
    },

    textContain: {
      width: '100%',
      marginTop:  25,
      flexDirection: 'row',
      justifyContent:'space-between'
    },
  
    containerThree: {
      width: '100%',
      height: 80,
      backgroundColor:Colors.GRAY_LIGHT,
    },
  
    text: {
      flexDirection:'row',
      justifyContent: 'space-between',
    },
  
    title: {
      marginTop: 10,
      marginRight: 20,
      fontWeight: 'bold',
      fontSize: Typography.FONT_SIZE_18,
      fontFamily: Typography.FONT_FAMILY_LIGHT,
      color: Colors.BLACK,
    },
  
    title2: {
      marginTop: 10,
      marginRight: 20,
      marginLeft: 20,
      fontSize: Typography.FONT_SIZE_17,
      fontFamily: Typography.FONT_FAMILY_LIGHT,
      color: Colors.BLACK,
    },
  
    subTitle: {
      marginTop: 5,
      marginRight: 10,
      marginLeft: 20,
      fontSize: Typography.FONT_SIZE_15,
      fontFamily: Typography.FONT_FAMILY_LIGHT,
      color: Colors.GRAY_TEXT,
    },
  
    history: {
      marginLeft: 10,
      fontSize: Typography.FONT_SIZE_14,
      fontFamily: Typography.FONT_FAMILY_LIGHT,
      color: Colors.BLACK,
    },
  
    history2: {  
      marginRight: 10,
      fontSize: Typography.FONT_SIZE_14,
      fontFamily: Typography.FONT_FAMILY_LIGHT,
      color: Colors.BLACK,
    },
  
    balance: {
      color: Colors.TEXT,
      fontWeight: 'bold',
      fontSize: Typography.FONT_SIZE_20,
      marginLeft: 20,
      marginRight: 20,
      marginTop: 30
    },
  
    containGain: {
     flexDirection: 'row',
     justifyContent: 'space-between',
    },
   
  });

export default styles