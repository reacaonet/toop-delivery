/* eslint-disable prettier/prettier */
import React, { useState, useCallback, useRef } from 'react';
import { Dimensions, Keyboard, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useFocusEffect } from '@react-navigation/native';

/** Styles */
import {
  styles,
  Container,
  Header,
  ViewHeaderIcon,
  HeaderContent,
  Divider,
  TextPlace,
  ListItemTouch,
  TitleListItem,
} from './styles';
import { Colors } from '../../../../../styles';

/** Settings */
import config from '../../../../../config';

/** Components */
import PlaceMap from '../PlaceMap';

const PlacesAutocomplete = ({
  current,
  coordinates,
  setShowModal,
  onClick,
}: any) => {
  const [modalLocation, setModalLocation] = useState<Boolean>(false);
  const googlePlaceRef = useRef<any>();
  const [type, setType] = useState('autocomplete');
  const [prePlaces] = useState<any>([
    // {
    //   description: ' ',
    //   value: 'Locais salvos',
    //   key: 'savedLocations',
    //   icon: 'bookmark-border',
    // },
    {
      description: ' ',
      value: 'Escolher no mapa',
      key: 'selectMap',
      icon: 'place',
    },
  ]);

  useFocusEffect(
    useCallback(() => {
      try {
        if (modalLocation === false) {
          Keyboard.dismiss();

          setTimeout(() => {
            googlePlaceRef.current?.focus();
          }, 500);
        }
      } catch (err) {
        //
      }

      return () => {
        setType('autocomplete');
      };
    }, [modalLocation, googlePlaceRef]),
  );

  const onPressPrePlaces = (data: any) => {
    if (data?.key && data?.key === 'savedLocations') {
      setModalLocation(true);
      return;
    }

    if (data?.key && data?.key === 'selectMap') {
      setType('maps');
      return;
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <Container>
          {type === 'autocomplete' ? (
            <Header>
              <ViewHeaderIcon onPress={() => setShowModal(false)}>
                <Icon name="navigate-before" size={40} />
              </ViewHeaderIcon>
              <HeaderContent>
                <GooglePlacesAutocomplete
                  ref={googlePlaceRef}
                  placeholder={current?.placeholder}
                  minLength={3}
                  debounce={800}
                  numberOfLines={4}
                  currentLocation={false}
                  textInputProps={{
                    placeholderTextColor: Colors.PRIMARY_DARK,
                  }}
                  onPress={(data: any) => {
                    if (data?.key) {
                      return onPressPrePlaces(data);
                    }

                    onClick(
                      data.place_id,
                      current?.type,
                      data.structured_formatting.main_text,
                      current.index,
                    );
                    setShowModal(false);
                  }}
                  query={{
                    key: config.apiGeoLocation,
                    language: 'pt-BR',
                    location: `${coordinates.latitude},${coordinates.longitude}`,
                    origin: `${coordinates.latitude},${coordinates.longitude}`,
                    radius: 2500,
                    // strictbounds: true,
                  }}
                  fetchDetails={false}
                  styles={{
                    container: {
                      position: 'absolute',
                      width: '100%',
                      zIndex: 999,
                    },
                    listView: {
                      width: Dimensions.get('window').width,
                      height: Dimensions.get('window').height,
                      marginTop: 10,
                      marginLeft: -35,
                    },
                    textInput: {
                      color: Colors.PRIMARY_DARK,
                      height: 45,
                      backgroundColor: Colors.GREY_BACKGROUND,
                      borderRadius: 5,
                      paddingVertical: 7,
                      paddingHorizontal: 11,
                      fontSize: 13,
                    },
                    row: {
                      width: Dimensions.get('window').width,
                    },
                  }}
                  enablePoweredByContainer={false}
                  predefinedPlaces={prePlaces}
                  renderRow={(results: any) => {
                    if (results.isPredefinedPlace) {
                      return (
                        <ListItemTouch
                          onPress={() => onPressPrePlaces(results)}>
                          {results?.icon ? (
                            <Icon
                              name={results?.icon}
                              size={25}
                              color={Colors.PRIMARY}
                              style={styles.iconStyle}
                            />
                          ) : null}
                          <TitleListItem>{results?.value}</TitleListItem>
                        </ListItemTouch>
                      );
                    }

                    return <TextPlace>{results.description}</TextPlace>;
                  }}
                />
              </HeaderContent>
              <Divider />
            </Header>
          ) : null}

          {type === 'maps' ? (
            <PlaceMap
              currentPlace={current}
              visibleModal={setShowModal}
              onClick={onClick}
              goBack={() => {
                setType('autocomplete');
              }}
            />
          ) : null}
        </Container>
      </SafeAreaView>
    </>
  );
};

export default PlacesAutocomplete;
