import React from 'react';

import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../../styles';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import History from './history';

interface Props {
  goBack: any;
  go: any;
}

const HistoryRun: React.FC<Props> = ({ goBack, go }) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState('');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      {/*  Header */}
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Text style={styles.title}>GANHOS</Text>
      </SafeAreaView>

      {/* BODY */}

      {/* CONTAINER 1 */}
      <View style={styles.container}>
        <View style={styles.text}>
          <Text style={styles.title2}>{t('races')}</Text>
          <Text style={styles.title2}>Ganhos</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.subTitle}>2</Text>
          <Text style={styles.subTitle}>{t('monetary')} 65,00</Text>
        </View>

        <View style={styles.borderLine} />

        <TouchableOpacity style={styles.button}>
          <View style={{ marginTop: 10, flexDirection: 'row' }}>
            <Icon name="navigate-before" size={24} style={styles.icon} />
            <View style={styles.day}>
              <Text>Hoje</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[{ title: 'Title Text', key: 'item1' }]}
        style={{ marginBottom: 10 }}
        renderItem={() => <History go={go} />}
      />
    </View>
  );
};

export default HistoryRun;
