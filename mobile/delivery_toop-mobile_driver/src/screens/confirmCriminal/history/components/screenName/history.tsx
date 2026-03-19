import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import styles from './styles';
// import { Container } from './styles';

const History: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={{ height: '100%', width: '100%', alignItems: 'center' }}>
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

      {/* CONTAINER 2 */}
      <View style={styles.containerTwo}>
        <View style={styles.text}>
          <Text style={styles.km}>12.25 · 20KM</Text>
          <Text style={styles.km}>{t('monetary')} 32,50</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.subTitle}>Nº 1242</Text>
        </View>

        <View style={styles.street}>
          <View style={styles.line}>
            <View style={styles.triangulo} />
            <View style={styles.route} />
            <View style={styles.ball} />
          </View>

          <View style={styles.box}>
            <Text style={styles.titleStreet}>
              Rua buriti, 363 - Jardim Mariliza, {'\n'}Goiânia - GO, 74885-155,
              Brasil
            </Text>

            <Text style={styles.titleStreet}>
              Rua6, Unid.101 - Pq Atheneu {'\n'}Goiânia - GO, 74776-455, Brasil
            </Text>
          </View>
        </View>
        <View style={styles.borderLine} />
        <TouchableOpacity style={styles.button}>
          <View style={{ alignSelf: 'center', width: '100%' }}>
            <Text style={{ textAlign: 'center', marginTop: 10 }}>VER MAIS</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* CONTAINER 2 */}
      <View style={styles.containerTwo}>
        <View style={styles.text}>
          <Text style={styles.km}>12.25 · 20KM</Text>
          <Text style={styles.km}>{t('monetary')} 32,50</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.subTitle}>Nº 1242</Text>
        </View>

        <View style={styles.street}>
          <View style={styles.line}>
            <View style={styles.triangulo} />
            <View style={styles.route} />
            <View style={styles.ball} />
          </View>

          <View style={styles.box}>
            <Text style={styles.titleStreet}>
              Rua buriti, 363 - Jardim Mariliza, {'\n'}Goiânia - GO, 74885-155,
              Brasil
            </Text>

            <Text style={styles.titleStreet}>
              Rua6, Unid.101 - Pq Atheneu {'\n'}Goiânia - GO, 74776-455, Brasil
            </Text>
          </View>
        </View>
        <View style={styles.borderLine} />
        <TouchableOpacity style={styles.button}>
          <View style={{ alignSelf: 'center', width: '100%' }}>
            <Text style={{ textAlign: 'center', marginTop: 10 }}>VER MAIS</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default History;
