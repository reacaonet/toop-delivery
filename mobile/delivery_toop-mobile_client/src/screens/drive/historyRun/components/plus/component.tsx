/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, { useCallback, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

// import { Input } from 'react-native-elements';
import Star from 'react-native-vector-icons/Entypo';
import { Rating } from 'react-native-elements';
import moment from 'moment';

import styles from './styles';
// import { Container } from './styles';

/** Util */
import { formatMoney } from '../../../../../utils';

/** Service */
import { isFavorite } from '../../../../../services/provider/driver/isFavorite';
import { favoriteDriver } from '../../../../../services/provider/driver/favorite';

const Plus = ({ booking }: any) => {
  const {
    user: { user = null },
    configurations = null,
  }: any = useSelector((state: any) => state);

  const { t } = useTranslation();

  const [showFavorite, setShowFavorite] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useFocusEffect(useCallback(
    () => {
      if (booking.driver?._id && user.passenger?._id) {
        isFavorite(booking.driver?._id, user.passenger?._id).then(result => {
          if (result && result?._id) {
            setFavorite(true);
          } else {
            setFavorite(false);
          }

          setShowFavorite(true);
        });
      } else {
        setShowFavorite(false);
        setFavorite(false);
      }
    },
    [booking.driver?._id, user.passenger?._id],
  ));

  const sendFavorite = async () => {
    const response = await favoriteDriver(booking.driver?._id, user.passenger?._id);
    if (response && response._id) {
      setFavorite(true);
    } else {
      setFavorite(false);
    }
  };

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.text}>
          <Text style={styles.title}>
            {moment(booking.createdAt).format('DD/MM/YYYY')}
          </Text>
          <Text style={styles.title}>{formatMoney(booking.price, configurations?.coin)}</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.subTitle}>
            {moment(booking.createdAt).format('HH:mm')}
          </Text>
          <Text style={styles.subTitle}>{formatMoney(0, configurations?.coin)}</Text>
        </View>

        <Image
          source={require('../../../../../assets/images/linered.png')}
          resizeMode="contain"
          style={{ width: '100%', marginBottom: 5 }}
        />
      </View>
      <View style={styles.final}>
        <Text style={styles.title2}>{booking?.statusTxt}</Text>
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
          <Text style={styles.credit}>Pagamento: {booking?.payment?.typePaymentTxt}</Text>
          {booking?.payment?.lastDigits ? (
            <>
              <Text style={styles.creditNumb}>•••{booking?.payment?.lastDigits}</Text>
              {booking?.payment?.card === 'mastercard' || booking?.payment?.card === 'master' ? (
                <Image
                  style={styles.image}
                  source={require('../../../../../assets/images/card.png')}
                />
              ) : null}

              {booking?.payment?.card === 'visa' ? (
                <Image
                  style={styles.image}
                  source={require('../../../../../assets/images/visa.png')}
                />
              ) : null}
            </>
          ) : null}
        </View>
      </View>

      {booking?.driver ? (
        <View style={styles.containerMoto}>
          {booking?.driver?.selfiePhoto && Array.isArray(booking?.driver?.selfiePhoto) && booking?.driver?.selfiePhoto.length > 0 ? (
            <Image
              style={styles.avatar}
              source={{
                uri: booking?.driver?.selfiePhoto[0],
              }}
            />
          ) : (
            <Image
              style={styles.avatar}
              source={require('../../../../../assets/images/photo.png')}
            />
          )}


          <View style={styles.atribute}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{booking?.driver?.name}</Text>
              {showFavorite ? (
                <TouchableOpacity style={styles.ViewHeart} onPress={() => sendFavorite()}>
                  {favorite ? (
                    <Icon name="favorite" size={20} style={styles.heart} />
                  ) : (
                    <Icon name="favorite-border" size={20} style={styles.heart} />
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={styles.car}>{`${booking?.driver?.vehicleManufacturer || ''} ${booking?.driver?.vehicleModel || ''} ${booking?.driver?.vehicleNameplate || ''}`}</Text>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 20,
                marginLeft: 5,
              }}>
              <Star name="star" size={20} style={styles.icon} />
              {booking?.driver?.stars ? (
                <Text style={styles.avaNumber}>{Number(booking?.driver?.stars).toFixed(1)}</Text>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {booking?.evaluation?.stars >= 1 ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <Rating
            type="star"
            style={{ marginLeft: 15 }}
            ratingColor="#F7DF0A"
            ratingBackgroundColor="#ffff"
            startingValue={booking?.evaluation?.stars}
            readonly
            ratingCount={5}
            imageSize={30}

          />
          <Text style={styles.avali}>{t('youRated')} !</Text>
        </View>
      ) : null}

      {/* <View style={styles.containerTwo}>
        <View style={styles.text}>
          <Text style={styles.credit}>Ajuda</Text>
        </View>
      </View>
      <View
        style={{ flexDirection: 'column', width: '90%', alignSelf: 'center' }}>
        <Input placeholder="Dúvidas frequentes" />
        <Input placeholder="Dúvidas frequentes 1" />
        <Input placeholder="Dúvidas frequentes 2" />
      </View> */}
    </View>
  );
};

export default Plus;
