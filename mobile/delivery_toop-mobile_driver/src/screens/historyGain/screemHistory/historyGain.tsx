import React from 'react';

import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../styles';
import styles from '../styles';

import Gain from './componentGain';

interface Props {
  goBack: any;
}

const History: React.FC<Props> = ({ goBack }) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState('');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>

        <Text style={styles.title}>GANHOS</Text>
      </SafeAreaView>

      <View style={styles.container}>
        <View style={styles.text}>
          <Text style={styles.title2}>Corridas</Text>
          <Text style={styles.title2}>Ganhos</Text>
        </View>

        <View style={styles.text}>
          <Text style={styles.subTitle}>35</Text>
          <Text style={styles.subTitle}>{t('monetary')} 732,10</Text>
        </View>

        <View style={styles.borderLine} />

        <View style={{ marginTop: 10, flexDirection: 'row' }}>
          <Icon name="navigate-before" size={24} style={styles.iconBack} />

          <Text style={styles.day}>01 de mar - 08 de mar</Text>
        </View>
      </View>

      <FlatList
        data={[{ title: 'Title Text', key: 'item1' }]}
        style={{ marginTop: 10 }}
        renderItem={() => <Gain />}
      />

      <View style={styles.containerThree}>
        <View style={styles.containGain}>
          <Text style={styles.balance}>Saldo atual </Text>
          <Text style={styles.balance}>{t('monetary')} 852,75</Text>
        </View>
      </View>
    </View>
  );
};

export default History;
