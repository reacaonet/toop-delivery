/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Dimensions,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Modalize } from 'react-native-modalize';
import { TextInputMask } from 'react-native-masked-text';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import {
  styles,
  Container,
  ContainerMap,
  ContentMarker,
  Image,
  ContainInput,
  Dot,
  Inputstyle,
  Border,
  ViewText,
  Text,
  TouchMap,
  TextMapConfirm,
  ModalContainer,
  TextAddress,
  TextInputAddress,
  TouchSingleDelivery,
  TextTouchSingle,
} from './styles';
import { Colors } from '../../styles';
import config from '../../config';

/** Components */
import CustomMarker from '../../components/Map/CustomMarker';

/** Service */
import {
  loosePriceDelivery,
  googleSearchAddres,
  createDelivery,
} from '../../services/provider/shopping/looseDelivery';
import { maskRealBeautify, toFloat } from './../../utils';

const Delivery: React.FC = () => {
  const navigation = useNavigation();

  const {
    authUser: { user = null },
  }: any = useSelector((state) => state);
  const touchMove = useRef(false);
  const addressDelivery = useRef<any>(null);

  const mapViewRef = useRef<any>(null);
  const modalizeRef = useRef<any>(Modalize);
  const [load, setLoad] = useState(false);
  const [originText, setOriginText]: any = useState('');
  const [region, setRegion] = useState<any>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [address, setAddres] = useState('');
  const [priceDelivery, setPriceDelivery] = useState('');
  const [total, setTotal] = useState('0');
  const [number, setNumber] = useState('');
  const [note, setNote] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (user?.company?.location?.coordinates) {
      setRegion({
        ...region,
        latitude: user?.company?.location?.coordinates[1] || 0,
        longitude: user?.company?.location?.coordinates[0] || 0,
      });
    }

    return () => { };
  }, [user?.company]);

  const calcPrice = async () => {
    try {
      if (!originText || !originText?.address) {
        return Alert.alert('Solicitação', 'Informe um endereço e o selecione');
      }

      setLoad(true);
      const resp = await loosePriceDelivery(user?.company?._id, {
        latitude: region.latitude,
        longitude: region.longitude,
      });

      if (resp && resp.errMessage) {
        setLoad(false);
        return Alert.alert('Solicitação', resp.errMessage);
      }

      const searchAddress = await googleSearchAddres(
        region.latitude,
        region.longitude,
      );
      setLoad(false);

      if (searchAddress && searchAddress.errMessage) {
        return Alert.alert('Solicitação', searchAddress.errMessage);
      }

      searchAddress.address = `${originText.address} - ${originText.addressSecondary}`;
      addressDelivery.current = searchAddress;

      setPriceDelivery(maskRealBeautify(resp.price, true, 'R$'));
      setAddres(originText?.address);
      modalizeRef.current?.open();
    } catch (err) {
      console.log('fail', err);
    }
  };

  const changeCoordinate = (coords: any) => {
    if (touchMove.current === false) {
      return;
    }

    if (
      parseFloat(region.latitude) === parseFloat(coords.latitude) &&
      parseFloat(region.longitude) === parseFloat(coords.longitude)
    ) {
      return;
    }

    setRegion({
      ...region,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    touchMove.current = false;
  };

  const sendLooseDelivery = async () => {
    try {
      // if (!category) {
      //   return Alert.alert('Formulário', 'Informe uma categoria');
      // }

      const { city = '', address = '' } = addressDelivery.current || {};

      // setLoad(true);
      let payload = {
        company: user?.company?._id,
        city: city,
        address: address,
        typeAddress: category,
        latitude: region.latitude,
        longitude: region.longitude,
        total: toFloat((total ?? '').replace('R$', '')),
        priceDelivery: toFloat((priceDelivery ?? '').replace('R$', '')),
        note: note,
        typeVehicle: 'MOTO',
        referencePoint: reference,
        district: complement,
        streetNumber: number,
      };

      const resp = await createDelivery(payload);
      setLoad(false);

      if (resp && resp.errMessage) {
        return Alert.alert('Solicitação', resp.errMessage);
      }

      return navigation.navigate('Orders');
    } catch (err) {
      setLoad(false);
    }
  };

  return (
    <Container>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Shopper', {
            screen: 'Home',
            params: '',
          })
        }>
        <Image
          source={require('../../assets/images/back.png')}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modalize ref={modalizeRef}>
        <ModalContainer>
          <TextAddress>Endereço</TextAddress>
          <TextInputAddress
            placeholder="Endereço"
            value={address}
            editable={false}
            onChangeText={setAddres}
          />

          <View style={styles.inputContainer}>
            <View style={[styles.inputFlex]}>
              <Text>Número</Text>
              <TextInput
                placeholder=""
                placeholderTextColor={Colors.GREY}
                style={[styles.inputFlex, styles.textInput]}
                value={number}
                onChangeText={setNumber}
                keyboardType={'numeric'}
                underlineColorAndroid="transparent"
              />
              {/* <Text numberOfLines={1} style={styles.txtError}>
                {number && number.length <= 0 ? 'Informe o Número' : null}
              </Text> */}
            </View>

            <View style={[styles.inputFlex]}>
              <Text>Apto/quadra/lote</Text>
              <TextInput
                placeholder=""
                placeholderTextColor={Colors.GREY}
                style={[styles.inputFlex, styles.textInput]}
                value={complement}
                onChangeText={setComplement}
                underlineColorAndroid="transparent"
              />
              {/* <Text numberOfLines={1} style={styles.txtError}>
                {complement && complement.length < 1
                  ? 'Informe um complemento válido'
                  : null}
              </Text> */}
            </View>
          </View>

          <View style={[styles.inputFlex]}>
            <Text>Ponto de Referência</Text>
            <TextInput
              placeholder=""
              placeholderTextColor={Colors.GREY}
              style={styles.textInput}
              value={reference}
              onChangeText={setReference}
            />
            {/* <Text numberOfLines={1} style={styles.txtError}>
              {reference && reference.length < 1
                ? 'Informe uma referência válida'
                : null}
            </Text> */}
          </View>

          {/* <View>
            <Text style={styles.titleFavorite}>Tipo Endereço</Text>
            <View style={styles.favoriteOption}>
              <TouchableOpacity
                style={[
                  styles.optionContainer,
                  styles.mr10,
                  category === 'HOME'
                    ? styles.optionContainerSelect
                    : null,
                ]}
                onPress={() => setCategory('HOME')}>
                <View>
                  <Icon
                    name={'home'}
                    size={30}
                    style={
                      category === 'HOME'
                        ? styles.colorWhite
                        : styles.colorGrey
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.txtOption,
                    category === 'HOME'
                      ? styles.colorWhite
                      : styles.colorGrey,
                  ]}>
                  Casa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionContainer,
                  styles.ml10,
                  category === 'WORK'
                    ? styles.optionContainerSelect
                    : null,
                ]}
                onPress={() => setCategory('WORK')}>
                <View>
                  <Icon
                    name={'business'}
                    size={30}
                    style={
                      category === 'WORK'
                        ? styles.colorWhite
                        : styles.colorGrey
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.txtOption,
                    category === 'WORK'
                      ? styles.colorWhite
                      : styles.colorGrey,
                  ]}>
                  Trabalho
                </Text>
              </TouchableOpacity>
            </View>
          </View> */}

          <View style={[styles.inputFlex]}>
            <Text>Valor Entrega</Text>
            <TextInput
              autoFocus={true}
              placeholder=""
              placeholderTextColor={Colors.GREY}
              style={[styles.inputFlex, styles.textInput]}
              value={priceDelivery}
              onChangeText={(text: string) =>
                setPriceDelivery(maskRealBeautify(text, false, 'R$'))
              }
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputFlex]}>
            <Text>Valor Encomenda</Text>
            <TextInput
              autoFocus={true}
              placeholder=""
              placeholderTextColor={Colors.GREY}
              style={[styles.inputFlex, styles.textInput]}
              value={total}
              onChangeText={(text: string) =>
                setTotal(maskRealBeautify(text, false, 'R$'))
              }
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputFlex]}>
            <Text>Observação</Text>
            <TextInput
              placeholder=""
              placeholderTextColor={Colors.GREY}
              style={styles.textInput}
              value={note}
              onChangeText={setNote}
            />
          </View>

          <TouchSingleDelivery
            onPress={() => sendLooseDelivery()}
            disabled={load}>
            <TextTouchSingle>
              {!load ? 'Concluir' : 'Aguarde ...'}
            </TextTouchSingle>
          </TouchSingleDelivery>
        </ModalContainer>
      </Modalize>

      <ContainerMap>
        {region?.latitude && region?.longitude ? (
          <MapView
            region={region}
            style={styles.map}
            showsUserLocation
            loadingEnabled
            zoomControlEnabled={true}
            zoomEnabled={true}
            ref={mapViewRef}
            onRegionChangeComplete={(coords) => {
              changeCoordinate(coords);
            }}
            onTouchMove={() => {
              if (touchMove.current === false) {
                touchMove.current = true;
              }
            }}
          />
        ) : null}

        {region?.latitude && region?.longitude ? (
          <ContentMarker pointerEvents={'none'}>
            <CustomMarker />
          </ContentMarker>
        ) : null}

        <ContainInput>
          <GooglePlacesAutocomplete
            placeholder="Para onde ?"
            minLength={4}
            numberOfLines={2}
            onPress={(data, details = null) => {
              if (details === null) {
                return;
              }

              setRegion({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                latitudeDelta: 0.0143,
                longitudeDelta: 0.0134,
                data,
                details,
              });

              setOriginText({
                address: data?.structured_formatting?.main_text || '',
                addressSecondary: data?.structured_formatting?.secondary_text || '',
              });
            }}
            query={{
              key: config.apiGeoLocation,
              language: 'pt-BR',
              components: 'country:br',
            }}
            fetchDetails={true}
            styles={{
              container: {
                position: 'absolute',
                top: 0,
                width: '100%',
                borderRadius: 8,
              },
              listView: {
                width: '100%',
                backgroundColor: 'orange',
              },
              textInput: {
                color: Colors.PRIMARY_DARK,
                height: 45,
                backgroundColor: Colors.GREY_BACKGROUND,
                elevation: 3,
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
            currentLocation={false}
          />
        </ContainInput>

        {region?.latitude && region?.longitude ? (
          <TouchMap disabled={load} onPress={() => calcPrice()}>
            <TextMapConfirm>{!load ? 'Pronto' : 'Aguarde ...'}</TextMapConfirm>
          </TouchMap>
        ) : null}
      </ContainerMap>
    </Container>
  );
};

export default Delivery;
