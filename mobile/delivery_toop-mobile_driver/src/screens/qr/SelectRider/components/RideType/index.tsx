/* eslint-disable prettier/prettier */
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSelector } from 'react-redux';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

/** Styles */
import { styles, PriceContainer } from './styles';

/** Util */
import { formatMoney } from '../../../../../utils';

const RideType = ({
  id,
  name,
  image,
  duration,
  price,
  ride,
  isSelected,
  onPress,
  showRaceFare,
}: any) => {
  const {
    configurations,
  }: any = useSelector((state: any) => state);

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

export default RideType;
