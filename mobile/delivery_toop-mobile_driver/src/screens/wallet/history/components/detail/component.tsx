import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Message from 'react-native-vector-icons/Entypo';
import { Input } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import styles from './styles';
// import { Container } from './styles';

interface Props {
  ir: any;
}

const DetailGain: React.FC<Props> = ({ ir }) => {
  const { t } = useTranslation();

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.text}>
          <Text style={styles.title}>Qui, 24 de abr.</Text>
          <Text style={styles.title}>{t('monetary')} 30,05</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.subTitle}>13:23 - 14:07</Text>
          <Text style={styles.subTitle}>Gorjeta {t('monetary')} 5,00</Text>
        </View>

        <Image
          source={require('../../../../assets/images/line.png')}
          resizeMode="contain"
          style={{ width: '100%', marginBottom: 5 }}
        />
      </View>
      <View style={styles.final}>
        <Text style={styles.title2}>FINALIZADA</Text>
        <TouchableOpacity onPress={ir}>
          <Message name="message" size={20} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.border} />

      <View style={styles.street}>
        <View style={styles.linha1}>
          <View style={styles.triangulo} />
          <View style={styles.linha} />
          <View style={styles.bola} />
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

      <View style={styles.containerTwo}>
        <View style={styles.text}>
          <Text style={styles.credit}>Ajuda</Text>
        </View>
      </View>
      <View
        style={{ flexDirection: 'column', width: '90%', alignSelf: 'center' }}>
        <Input placeholder="Dúvidas frequentes" />
        <Input placeholder="Reportar algo" />
        <Input placeholder="Dúvidas frequentes" />
        <Input placeholder="Reportar algo" />
      </View>
    </View>
  );
};

export default DetailGain;
