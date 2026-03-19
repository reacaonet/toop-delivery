import {StyleSheet} from 'react-native'
import {Colors, Typography} from '../../../styles';

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      
      marginTop: 22
    },
    modalView: {
      width: '100%',
      height: 300,
      position: 'absolute',
      bottom: 0, 
      backgroundColor: "white",
      flexDirection: 'row',
      justifyContent: 'space-between',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
  
     
    },
    modal: {
      width: '100%',
      marginLeft: 40,
      position: 'absolute',
      bottom: 160, 
      backgroundColor: Colors.WHITE,
      flexDirection: 'column',

    },
    modal2: {
        width: '80%',
        alignSelf: 'center',
        position: 'absolute',
        bottom: 100, 
        backgroundColor: Colors.WHITE,
        flexDirection: 'column',
    },

    contain: {
        width: '100%',
        height: 70,
        bottom: 0,
        position: 'absolute',
        backgroundColor: Colors.GREY_LIGHT,
    },

    title:{
      fontSize: Typography.FONT_SIZE_16,
      fontWeight:'bold',
      color: Colors.BLACK
    },
    subTitle: {
        fontSize: Typography.FONT_SIZE_14,
        color: Colors.GRAY_TEXT
    },
    text: {
      fontSize: Typography.FONT_SIZE_16,
      color: Colors.BLACK
    },

    
  borderLine: {
    width: '100%',
    marginTop: 20,
    alignSelf: 'center',
    borderColor: Colors.GRAY_LIGHT,
    borderWidth: 1
  },

    icon: {
      marginRight: 30,
      marginTop: 20,
    },
    buttonClose: {
      backgroundColor: "#2196F3",
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      marginTop: 20, 
      marginLeft: 30,
      fontWeight: 'bold',
      fontSize: Typography.FONT_SIZE_16,
    },

 
  });


export default styles