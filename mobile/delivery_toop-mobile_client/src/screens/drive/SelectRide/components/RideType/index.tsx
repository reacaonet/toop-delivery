/* eslint-disable prettier/prettier */
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSelector } from 'react-redux';

/** Styles */
import { styles, PriceContainer } from './styles';

/** Util */
import { formatMoney } from '../../../../../utils';

export const RideType = ({
  id,
  name,
  image,
  duration,
  price,
  ride,
  isSelected,
  onPress,
  // showRaceFare,
}: any) => {
  const { configurations = null }: any = useSelector<any>((state: any) => state);

  return (
    <TouchableWithoutFeedback
      key={id}
      style={[{ width: '100%' }]}
      onPress={onPress}>
      <View style={[styles.container, isSelected && styles.rideSelected]}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.rideTitleAndduration}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.duration}>{duration}</Text>
          {ride?.capacity && ride?.capacity > 1 ? (
            <Text style={styles.duration}>Até {ride?.capacity} passageiros</Text>
          ) : null}
          {ride?.capacity && ride?.capacity === 1 ? (
            <Text style={styles.duration}>Até {ride?.capacity} passageiro</Text>
          ) : null}

          {ride?.info && typeof ride?.info === 'string' && `${ride?.info}`.length > 2 ? (
            <Text style={styles.duration}>{ride?.info}</Text>
          ) : null}
        </View>

        <PriceContainer>
          <Text style={ride?.voucher?.total ? styles.priceOld : styles.price}>{price}</Text>
          {ride?.voucher?.priceWithVoucher >= 0 ? (
            <Text style={styles.price}>{formatMoney(ride?.voucher?.priceWithVoucher, configurations?.coin)}</Text>
          ) : null}
        </PriceContainer>


        {/* <MaterialIcon name={'info'} size={25} color={Colors.GRAY_DARK} style={styles.infoIcon} onPress={() => {
          showRaceFare(true);
        }} /> */}
      </View>
    </TouchableWithoutFeedback>
  );
};
