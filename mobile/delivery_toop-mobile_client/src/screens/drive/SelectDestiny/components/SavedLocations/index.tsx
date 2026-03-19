/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import {
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/core';

/** Styles */
import {
  styles,
  styleGooglePlace,
  ContainerModal,
  Header,
  MenuButton,
  HeaderTitle,
  Divider,
  Content,
  ListPlaces,
  ListItemPlace,
  ListItem,
  TitleListItem,
  DividerList,
  Input,
  TextLabel,
  ContainerRegister,
  BtnSave,
  TxtBtnSave,
} from './styles';
import { Colors } from '../../../../../styles';

/** Settings */
import config from '../../../../../config';

/** components */
import SelectInMap from './components/SelectInMap';

/** Services */
import {
  createFavoritePlace,
  listFavoritePlace,
} from '../../../../../services/provider/passenger/favoritePlaces';
import { geoCode } from '../../../../../services/provider/maps/geoCode';

const SavedLocations = ({
  visible,
  setVisible,
  modalPlace,
  onClick,
  currentPlace,
}: any) => {
  const {
    user: { user = null },
    location: { coords: coordinates = null },
  }: any = useSelector((state: any) => state);

  const googlePlaceRef = useRef<any>();
  const [places, setPlaces] = useState<any>([]);
  const [titlePage, setTitlePage] = useState('LOCAIS SALVOS');
  const [type, setType] = useState('list');
  const currentSelected = useRef<any>(null);

  /** Form */
  const placeName = useRef<any>(null);
  const [loadBtn, setLoadBtn] = useState(false);

  const [prePlaces] = useState<any>([
    {
      description: ' ',
      value: 'Escolher no mapa',
      key: 'selectMap',
      icon: 'place',
    },
  ]);

  useEffect(() => {
    try {
      Keyboard.dismiss();

      setTimeout(() => {
        googlePlaceRef.current?.focus();
      }, 400);
    } catch (err) {
      //
    }

    return () => {
      resetValues();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      listFavoritePlace({}).then((result: any) => {
        if (result && Array.isArray(result) && result.length > 0) {
          setPlaces(result);
        } else {
          setPlaces([]);
        }
      });
    }, []),
  );

  const sendForm = async () => {
    try {
      if (!placeName.current || placeName.current.length <= 3) {
        return Alert.alert(
          'Nome',
          'Informe um nome com pelo menos 3 caracteres',
        );
      }

      if (!currentSelected.current) {
        return Alert.alert('Endereço', 'Nenhum Endereço informado');
      }

      let details: any = await geoCode({
        placeId: currentSelected.current?.data?.place_id,
      });

      if (!details || !details.geometry) {
        return Alert.alert('Endereço', 'Não foi possível encontrar o endereço');
      }

      setLoadBtn(true);
      let payload = {
        passenger: user?.passenger?._id,
        name: placeName.current,
        latitude: details.geometry.location.lat || 0,
        longitude: details.geometry.location.lng || 0,
        shortAddress:
          currentSelected.current?.data.structured_formatting.main_text,
        address: currentSelected.current?.data?.description,
      };

      const response = await createFavoritePlace(payload);
      setLoadBtn(false);

      if (response && response.errMessage) {
        return Alert.alert('Localização', response.errMessage);
      }

      onClick(
        currentSelected.current?.detail,
        currentPlace?.type,
        currentSelected.current?.data.structured_formatting.main_text,
        currentPlace?.index,
      );
      resetValues();
    } catch (err) {
      setLoadBtn(false);
    }
  };

  const clickItemFavoritePlace = async (item: any) => {
    onClick(
      {
        formatted_address: item?.address || '',
        geometry: {
          location: {
            lat: item?.location.coordinates[1],
            lng: item?.location.coordinates[0],
          },
        },
      },
      currentPlace?.type,
      item?.name,
      currentPlace?.index,
    );

    resetValues();
  };

  const resetValues = () => {
    setVisible(false);
    setTitlePage('LOCAIS SALVOS');
    setType('list');
    currentSelected.current = null;
    modalPlace(false);
  };

  return (
    <ContainerModal
      animationType="slide"
      visible={visible}
      onRequestClose={() => {
        setVisible(false);
        resetValues();
      }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header>
          <MenuButton
            onPress={() => {
              setVisible(false);
              resetValues();
            }}>
            <Icon name="navigate-before" size={28} color={Colors.BLACK} />
          </MenuButton>
          <HeaderTitle>{titlePage}</HeaderTitle>
        </Header>

        <Divider />

        <Content>
          {type === 'list' ? (
            <ListPlaces
              data={places}
              keyExtractor={(item: any) => item._id.toString()}
              ListHeaderComponent={() => {
                return (
                  <>
                    <ListItemPlace
                      onPress={() => {
                        setType('registerSelect');
                      }}>
                      <Icon
                        name="add"
                        size={25}
                        color={Colors.PRIMARY}
                        style={styles.iconStyle}
                      />
                      <TitleListItem>Adicionar novo local</TitleListItem>
                    </ListItemPlace>
                    <DividerList />
                  </>
                );
              }}
              renderItem={({ item }: any) => {
                return (
                  <ListItemPlace
                    onPress={() => {
                      clickItemFavoritePlace(item);
                    }}>
                    <Icon
                      name="bookmark"
                      size={25}
                      color={Colors.PRIMARY}
                      style={styles.iconStyle}
                    />
                    <TitleListItem>{item?.name}</TitleListItem>
                  </ListItemPlace>
                );
              }}
              ItemSeparatorComponent={() => {
                return <DividerList />;
              }}
            />
          ) : null}

          {type === 'registerSelect' ? (
            <GooglePlacesAutocomplete
              ref={googlePlaceRef}
              placeholder={'Informe Endereço'}
              minLength={3}
              debounce={800}
              numberOfLines={4}
              currentLocation={false}
              textInputProps={{
                placeholderTextColor: Colors.PRIMARY_DARK,
                autoFocus: true,
              }}
              query={{
                key: config.apiGeoLocation,
                language: 'pt-BR',
                location: `${coordinates.latitude},${coordinates.longitude}`,
                origin: `${coordinates.latitude},${coordinates.longitude}`,
                radius: 2500,
              }}
              styles={styleGooglePlace}
              enablePoweredByContainer={false}
              fetchDetails={false}
              predefinedPlaces={prePlaces}
              onPress={(data: any, detail = null) => {
                currentSelected.current = {
                  data: data,
                  detail: detail,
                };
                setType('register');
                setTitlePage('SALVAR LOCAL');
              }}
              renderRow={(results: any) => {
                if (results.isPredefinedPlace) {
                  return (
                    <ListItemPlace
                      onPress={() => {
                        Keyboard.dismiss();
                        setType('selectMap');
                        setTitlePage('Selecionar Localização');
                      }}>
                      {results?.icon ? (
                        <Icon
                          name={results?.icon}
                          size={25}
                          color={Colors.PRIMARY}
                          style={styles.iconStyle}
                        />
                      ) : null}
                      <TitleListItem>{results?.value}</TitleListItem>
                    </ListItemPlace>
                  );
                }

                return (
                  <ListItem>
                    <Icon
                      name="search"
                      size={25}
                      color={Colors.PRIMARY}
                      style={styles.iconStyle}
                    />
                    <TitleListItem color={Colors.GRAY_MAX_DARK}>
                      {results.description}
                    </TitleListItem>
                  </ListItem>
                );
              }}
            />
          ) : null}

          {type === 'register' ? (
            <ContainerRegister
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <TextLabel>Nome</TextLabel>
              <Input
                placeholder="ex: casa do Pedro"
                placeholderTextColor={Colors.GRAY_MAX_DARK}
                onChangeText={value => {
                  placeName.current = value;
                }}
              />

              <TextLabel>Endereço</TextLabel>
              <Input
                placeholder="Endereço"
                placeholderTextColor={Colors.BLACK}
                value={
                  currentSelected.current?.data?.structured_formatting
                    ?.main_text || ''
                }
                editable={false}
                selectTextOnFocus={false}
              />

              <BtnSave onPress={() => sendForm()} disabled={loadBtn}>
                {!loadBtn ? (
                  <TxtBtnSave>Salvar</TxtBtnSave>
                ) : (
                  <ActivityIndicator color={Colors.WHITE} size={'small'} />
                )}
              </BtnSave>
            </ContainerRegister>
          ) : null}

          {type === 'selectMap' ? (
            <SelectInMap
              nextConfirm={(response: any) => {
                currentSelected.current = response;
                setType('register');
                setTitlePage('SALVAR LOCAL');
              }}
            />
          ) : null}
        </Content>
      </SafeAreaView>
    </ContainerModal>
  );
};

export default memo(SavedLocations);
