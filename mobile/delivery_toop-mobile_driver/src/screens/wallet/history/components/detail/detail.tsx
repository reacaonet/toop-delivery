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
import DetailGain from './component';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../../../styles';
import styles from './styles';

interface Props {
  navigation: any;
}

const Detail: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  function ir() {
    navigation.navigate('Conversation');
  }
  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={() => navigation.navigate('HistoryCar')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>

        <Text style={styles.title}>{t('raceDetails')}</Text>
      </SafeAreaView>

      <FlatList
        data={[{ title: 'Title Text', key: 'item1' }]}
        style={{ marginTop: 10 }}
        renderItem={() => <DetailGain ir={ir} />}
      />
    </View>
  );
};

export default Detail;
