import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import styles from './styles';

// import { Container } from './styles';

interface Props {
  go: any;
}

const History: React.FC<Props> = ({ go }) => {
  const { t } = useTranslation();

  return (
    <View>
      {/* CONTAINER 1 */}
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
        <TouchableOpacity style={styles.button} onPress={go}>
          <View style={{ alignSelf: 'center', width: '100%' }}>
            <Text style={{ textAlign: 'center', marginTop: 10 }}>VER MAIS</Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* FIM CONTAINER 1 */}

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
      {/* FIM CONTAINER 2 */}

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
      {/* FIM CONTAINER 2 */}

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
      {/* FIM CONTAINER 2 */}
    </View>
  );
};

export default History;
