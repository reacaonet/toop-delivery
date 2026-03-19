import React, { useState } from 'react';

import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/core';
import { useTranslation } from 'react-i18next';

import PlusComp from './component';
import { Colors } from '../../../../../styles';
import styles from './styles';

interface Props {
  navigation: any;
}

const Detail: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  const route = useRoute<any>();
  const [booking] = useState<any>(route.params?.booking);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>

        <Text style={styles.title}>detalhes da {t('races')}</Text>
      </SafeAreaView>

      <FlatList
        data={[{ title: 'Title Text', key: 'item1' }]}
        style={{ marginTop: 10 }}
        renderItem={() => <PlusComp booking={booking} />}
      />
    </View>
  );
};

export default Detail;
