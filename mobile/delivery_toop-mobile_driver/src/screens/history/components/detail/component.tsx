import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import moment from 'moment';
import Message from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import styles from './styles';

import { formatMoney } from '../../../../utils';
import { Colors } from '../../../../styles';

interface Props {
  booking?: any;
  ir: any;
}

const DetailGain: React.FC<Props> = ({ ir, booking }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const { configurations = null }: any = useSelector((state: any) => state);

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.text}>
          <Text style={styles.title}>
            {booking?.createdAt
              ? moment(booking?.createdAt).utc(true).format('DD/MM/YYYY')
              : ''}
          </Text>
          <Text style={styles.title}>
            {/* {formatMoney(booking?.price || 0)} */}
            {booking?.priceDriver
              ? formatMoney(booking?.priceDriver || 0, configurations?.coin)
              : formatMoney(booking?.price || 0, configurations?.coin)}
          </Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.subTitle}>
            {booking?.createdAt
              ? moment(booking?.createdAt).utc(true).format('HH:mm')
              : ''}
          </Text>
          {/* <Text style={styles.subTitle}>Gorjeta  5,00</Text> */}
        </View>

        <Image
          source={require('../../../../assets/images/line.png')}
          resizeMode="contain"
          style={{ width: '100%', marginBottom: 5 }}
        />
      </View>
      <View style={styles.final}>
        <Text style={styles.title2}>{booking?.statusTxt}</Text>
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
          <Text style={styles.titleStreet}>{booking?.origin?.address}</Text>

          {booking?.destiny &&
            Array.isArray(booking?.destiny) &&
            booking?.destiny.length > 0 ? (
            <Text style={styles.titleStreet}>
              {booking?.destiny[booking?.destiny.length - 1].address}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.containerTwo}>
        <View style={styles.text}>
          <Text style={styles.credit}>
            Pagamento: {booking?.payment?.typePaymentTxt}
          </Text>
          {booking?.payment?.lastDigits ? (
            <>
              <Text style={styles.creditNumb}>
                •••{booking?.payment?.lastDigits}
              </Text>
              {booking?.payment?.card === 'mastercard' ||
                booking?.payment?.card === 'master' ? (
                <Image
                  style={styles.image}
                  source={require('../../../../assets/images/card/card.png')}
                />
              ) : null}

              {booking?.payment?.card === 'visa' ? (
                <Image
                  style={styles.image}
                  source={require('../../../../assets/images/card/visa.png')}
                />
              ) : null}
            </>
          ) : null}
        </View>
      </View>

      {booking?.status === 'concluded' ? (
        <TouchableOpacity
          style={styles.raceFeeTouch}
          onPress={() => navigation.navigate('RaceFare', booking)}>
          <Text style={styles.txtRaceFee}>tarifas da {t('race')}</Text>
          <View>
            <Icon name="navigate-next" size={40} color={Colors.WHITE} />
          </View>
        </TouchableOpacity>
      ) : null}

      {/*  <View style={styles.containerTwo}>
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
      </View> */}
    </View>
  );
};

export default DetailGain;
