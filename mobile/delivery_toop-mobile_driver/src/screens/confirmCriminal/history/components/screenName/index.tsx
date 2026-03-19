import React from 'react';

import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Typography, Colors } from '../../../../styles';
import styles from './styles'
import History from './history'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

interface Props {
  goBack: any
  submit: any
}

 
const HistoryRun: React.FC<Props> = ({
  goBack,
  submit
}) => {

 
  const [text, setText] = React.useState('');

  

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
     {/*  Header */}
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={goBack} >
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Text style={styles.title}>GANHOS</Text>
      </SafeAreaView>

      {/* BODY */}
   
    {/*   </ScrollView> */}
    <KeyboardAwareScrollView style={{height: '20%'}} enableOnAndroid viewIsInsideTabBar={true}>
      <History/>
    </KeyboardAwareScrollView>
    </View>

  );
};



export default HistoryRun;

