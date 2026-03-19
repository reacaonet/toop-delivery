import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Colors } from '../../../../styles';
import styles from '../styles';

const ComponentGain = (): any => {
  const { t } = useTranslation();

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

export default ComponentGain;
