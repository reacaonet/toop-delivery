/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { decode } from '@googlemaps/polyline-codec';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

/** Components */
import styles from './styles';
import MapFastBoarding from '../../../components/MapFastBoarding';
import RideType from './components/RideType';
import RaceFare from '../RaceFare';

/** Service */
import { listServices } from '../../../services/provider/service/list';

/** Util */
import { formatMoney, calculateRideArriveTime } from '../../../utils';
import Icon from 'react-native-vector-icons/FontAwesome5';

/** Images */
import imageOrigin from '../../../assets/images/maps/origin.png';
import imageDestiny from '../../../assets/images/maps/destiny.png';

type RideData = {
  _id: string;
  images: string[];
  name: string;
  overviewPolyline?: any;
};

const SelectRider = () => {
  const {
    authUser: { user = null },
    configurations,
  }: any = useSelector((state: any) => state);

  const dispatch: any = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const scrollRef = useRef<any>();
  const [selectedRide, setSelectedRide]: any = useState({});
  const [rides, setRides] = useState<RideData[]>([]);
  const [showRaceFare, setShowRaceFare] = useState(false);
  const [chosenOrigin] = useState(route?.params?.chosenOrigin || {});
  const [chosenDestination] = useState(route?.params?.chosenDestination || {});
  const [additionalStops] = useState(route?.params?.additionalStops || []);
  const [qrCode] = useState(route.params?.qrCode || '');
  const [driver] = useState(route.params?.driver || '');

  const { goBack } = useNavigation();

  const handleSelectRide = (ride: any) => {
    try {
      setSelectedRide(ride);

      if (scrollRef && scrollRef.current) {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    } catch (err) {
      //
    }
  };

  useEffect(() => {
    if (
      user &&
      user?._id &&
      chosenOrigin?.latitude &&
      chosenDestination?.latitude &&
      additionalStops
    ) {
      let listAdditionalStops = '';

      if (additionalStops && Array.isArray(additionalStops) && additionalStops.length > 0) {
        additionalStops.map((item: any) => {
          listAdditionalStops += `${item?.latitude || 0},${item?.longitude || 0}|`;
        });
      }

      listServices({
        person: user._id,
        passenger: user?.passenger?._id,
        origenLatitude: chosenOrigin?.latitude || 0,
        origenLongitude: chosenOrigin?.longitude || 0,
        destinyLatitude: chosenDestination?.latitude || 0,
        destinyLongitude: chosenDestination?.longitude || 0,
        additionalStops: listAdditionalStops,
        franchise: user?.franchise,
        driver: driver?._id || '',
      }).then(result => {
        if (result && Array.isArray(result) && result.length > 0) {
          setRides(result);
        } else {
          setRides([]);
        }
      });
    }
  }, [user, chosenOrigin, chosenDestination, additionalStops]);

  const onPressNext = () => {
    dispatch({
      type: 'UPDATE_BOOKING_SAGA',
      payload: {
        service: selectedRide,
      },
    });

    navigation.navigate('ConfirmRide', {
      chosenOrigin: chosenOrigin,
      chosenDestination: chosenDestination,
      additionalStops: additionalStops,
      selectService: selectedRide,
      qrCode,
      driver,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      ref={scrollRef}>
      <RaceFare service={selectedRide} showRaceFare={showRaceFare} setShowRaceFare={setShowRaceFare} />
      <TouchableOpacity style={styles.header} onPress={goBack}>
        <Icon name="chevron-left" size={21} />
      </TouchableOpacity>
      <View style={styles.map}>
        {chosenOrigin && chosenDestination && additionalStops ? (
          <MapFastBoarding
            nearby={true}
            chosenOrigin={route?.params?.chosenOrigin || {}}
            chosenDestination={route?.params?.chosenDestination || {}}
            additionalStops={route?.params?.additionalStops || []}
            imageOrigin={imageOrigin}
            imageDestiny={imageDestiny}
            showBtnLocation={!showRaceFare}
            overviewPolyline={
              rides &&
                Array.isArray(rides) &&
                rides.length > 0 &&
                rides[0]?.overviewPolyline &&
                rides[0]?.overviewPolyline?.points
                ? decode(rides[0].overviewPolyline?.points).map((item: any) => {
                  return {
                    latitude: item[0],
                    longitude: item[1],
                  };
                })
                : null
            }
          />
        ) : null}
      </View>
      {driver && driver?._id ? (
        <>
          <Text style={styles.title}>
            Escolha o tipo de sua viagem com Motorista
          </Text>
          <Text style={styles.titleDriver}>{driver?.name || ''}</Text>
        </>
      ) : (
        <Text style={styles.title}>Selecione o tipo de viagem</Text>
      )}

      <View>
        <ScrollView>
          {rides && Array.isArray(rides) && rides.length > 0 && rides[0]?._id
            ? rides.map((ride: any) => (
              <RideType
                id={ride._id}
                key={ride._id}
                name={ride.name}
                image={ride.images[0]}
                duration={calculateRideArriveTime(ride.routeTime)}
                price={formatMoney(ride.price, configurations?.coin)}
                ride={ride}
                isSelected={selectedRide?._id === ride?._id}
                onPress={() => handleSelectRide(ride)}
                showRaceFare={() => {
                  setShowRaceFare(true);
                  handleSelectRide(ride);
                }}
              />
            ))
            : null}
        </ScrollView>
      </View>

      {selectedRide && selectedRide?._id ? (
        <TouchableOpacity
          disabled={!selectedRide?._id}
          onPress={() => onPressNext()}
          style={styles.requestRideButton}>
          <Text style={styles.requestRideButtonText}>
            Pedir {selectedRide.name}
          </Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

export default SelectRider;
