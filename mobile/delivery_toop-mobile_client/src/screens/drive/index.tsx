/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import Tabs from '../home/components/Tabs';

/** Services */
import { getCurrentPosition } from '../../store/actions/location';
import { listSliders } from '../../services/provider/slider';

import { Container, MapContainer, ViewSlider } from './styles';

/** Components */
import Map from '../../components/Map';
import SearchAddress from './components/searchAddress';
import Slider from './components/slider/Slider';

const Delivery = () => {
  const dispatch: any = useDispatch();

  const {
    booking = null,
    user: { user = null },
    tab: { category = 'delivery' },
    location: { coords: coordinates = null },
  }: any = useSelector(state => state);

  const navigation = useNavigation();
  const inProgess = useRef(false);
  const [sliders, setSliders] = useState<any[]>([]);
  const [images, setImages] = useState<any>();

  useFocusEffect(
    useCallback(() => {
      dispatch(getCurrentPosition());

      return () => {
        //
      };
    }, []),
  );

  useEffect(() => {
    if (category === 'delivery' || category === 'service') {
      navigation.navigate('Home');
    }
  }, [category]);

  useFocusEffect(
    useCallback(() => {
      if (booking && booking?.status === 'waiting') {
        navigation.navigate('RideAndTravelStack', {
          screen: 'Ride',
        });
      } else if (
        booking &&
        (booking?.status === 'accepted' || booking?.status === 'in_progress')
      ) {
        navigation.navigate('RideAndTravelStack', {
          screen: 'RaceAccepted',
        });
      }
    }, [booking]),
  );

  useEffect(() => {
    let params: any = {};
    let isParams = false;

    params.type = 'passenger';

    if (user?.passenger?.franchise) {
      isParams = true;
      params.franchise = user?.passenger?.franchise;
    } else if (coordinates && coordinates?.latitude && coordinates?.longitude) {
      isParams = true;
      params.latitude = coordinates?.latitude;
      params.longitude = coordinates?.longitude;
    }

    if (isParams && inProgess.current === false && sliders.length <= 0) {
      inProgess.current = true;

      listSliders(params).then((result: any) => {
        if (result && Array.isArray(result)) {
          let listImages: any = [];

          result.map(item => {
            if (item && item?.image && item?.image[0]) {
              listImages.push(item?.image[0]);
            }
          });

          setImages(listImages);
          setSliders(result);
        } else {
          setImages([]);
          setSliders([]);
        }

        setTimeout(() => {
          inProgess.current = false;
        }, 1000);
      });
    }
  }, [user?.passenger?.franchise, coordinates]);

  return (
    <Container>
      <Tabs />

      <SearchAddress navigation={navigation} />

      <MapContainer>
        <Map nearby={true} />
      </MapContainer>

      <ViewSlider>
        <Slider images={images} sliders={sliders} />
      </ViewSlider>
    </Container>
  );
};

export default Delivery;
