/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';

import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography, Colors } from '../../../styles';
import styles from '../styles';

const componentGain: React.FC = () => {
  const { t } = useTranslation();
  const [text, setText] = React.useState('');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE, bottom: 0 }}>
      <View style={styles.containerOne}>
        <View style={styles.textContain}>
          <Text style={styles.history}>DOM · 11</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>
      </View>

      <View style={styles.containTwo}>
        <View style={styles.textContain}>
          <Text style={styles.history}>SEG · 12</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>
      </View>
      <View style={styles.containerOne}>
        <View style={styles.textContain}>
          <Text style={styles.history}>TER · 13</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>
      </View>

      <View style={styles.containTwo}>
        <View style={styles.textContain}>
          <Text style={styles.history}>QUA · 14</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>
      </View>

      <View style={styles.containerOne}>
        <View style={styles.textContain}>
          <Text style={styles.history}>QUI · 15</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>
      </View>

      <View style={styles.containTwo}>
        <View style={styles.textContain}>
          <Text style={styles.history}>SEX · 16</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>
      </View>

      <View style={styles.containerOne}>
        <View style={styles.textContain}>
          <Text style={styles.history}>SAB · 17</Text>
          <Text style={styles.history2}>{t('monetary')} 52,00</Text>
        </View>
      </View>
    </View>
  );
};

export default componentGain;
