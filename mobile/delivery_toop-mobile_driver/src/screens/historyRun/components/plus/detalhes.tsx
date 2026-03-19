import React from 'react';

import {
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PlusComp from './component';
import { Colors } from '../../../../styles';
import styles from './styles';

interface Props {
  navigation: any;
}

const Plus: React.FC<Props> = ({ navigation }) => {
  function ir() {
    navigation.navigate('Conversation');
  }
  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={() => navigation.navigate('HistoryRunning')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>

        <Text style={styles.title}>DETALHES DA CORRIDA</Text>
      </SafeAreaView>

      <FlatList
        data={[{ title: 'Title Text', key: 'item1' }]}
        style={{ marginTop: 10 }}
        renderItem={() => <PlusComp ir={ir} />}
      />
    </View>
  );
};

export default Plus;
