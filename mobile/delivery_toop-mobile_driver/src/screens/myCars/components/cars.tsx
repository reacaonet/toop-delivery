/* eslint-disable prettier/prettier */
import React, { useCallback, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Typography, Colors } from '../../../styles';
import { ButtonCar, ButtonCarText } from './styles';
import { useTranslation } from 'react-i18next';

/** Service */
import { listVehicleDocuments, updateVehicleDocuments } from '../../../services/provider/user/vehicleDocuments';

interface Props {
  open: any;
  cad: any;
}

const CarsContain: React.FC<Props> = ({ open, cad }) => {
  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  const { t } = useTranslation();
  const [pending, setPending] = useState<any>([]);
  const [approved, setApproved] = useState<any>([]);

  const setActive = (id: string) => {
    Alert.alert('Tem certeza que quer marcar esse carro como ativo?', undefined, [
      { text: 'Cancelar' },
      {
        text: 'Continuar',
        onPress: () => updateVehicleDocuments(id, { status: true })
          .then(loadData)
      }
    ]);
  }

  const loadData = () => {
    listVehicleDocuments(user?._id, {
      approved: true,
    }).then(result => {
      if (result && Array.isArray(result) && result.length > 0) {
        setApproved(result);
      } else {
        setApproved([]);
      }
    });

    listVehicleDocuments(user?._id, {
      approved: false,
    }).then(result => {
      if (result && Array.isArray(result) && result.length > 0) {
        setPending(result);
      } else {
        setPending([]);
      }
    });
  }

  useFocusEffect(useCallback(loadData, [user]));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <Text style={styles.sub}>APROVADOS PARA USO</Text>

      {approved
        ? approved.map((item: any) => {
          return (
            <TouchableOpacity style={styles.containerTwo} key={item._id} disabled={item.status} onPress={() => setActive(item._id)}>
              <Image
                source={require('../../../assets/images/palio.png')}
                style={styles.iconCar}
              />
              <View style={styles.containCar}>
                <Text style={styles.carName}>
                  {item?.vehicleManufacturer} {item?.vehicleModel}
                </Text>
                <Text style={styles.placa}>{item?.vehicleNameplate}</Text>
              </View>

              {!!item.status && <Text style={styles.activeBadge}>Ativo</Text>}
            </TouchableOpacity>
          );
        })
        : null}

      <View style={{ height: '90%', width: '100%', alignItems: 'center' }}>
        {pending && Array.isArray(pending) && pending.length > 0 ? (
          <Text style={styles.subTitle}>APROVAÇÃO PENDENTE</Text>
        ) : null}

        {pending
          ? pending.map((item: any) => {
            return (
              <View style={styles.containerTwo} key={item._id}>
                <Image
                  source={require('../../../assets/images/punto.png')}
                  style={styles.iconCar}
                />
                <TouchableOpacity onPress={() => {
                  open(item);
                }}>
                  <View style={styles.button}>
                    <View style={styles.containCar}>
                      <Text style={styles.carName} >{item?.vehicleManufacturer} {item?.vehicleModel}</Text>
                      <Text style={styles.placa}>{item?.vehicleNameplate}</Text>
                    </View>

                    <Icon
                      name="navigate-next"
                      size={25}
                      style={styles.iconInd}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
          : null}

        {/* <View style={styles.containerTwo}>
          <Image
            source={require('../../../assets/images/palioVermelho.png')}
            style={styles.iconCar}
          />
          <TouchableOpacity onPress={open}>
            <View style={styles.button}>
              <View style={styles.containCar}>
                <Text style={styles.carName}>FIAT PALIO</Text>
                <Text style={styles.placa}>BAP-3298</Text>
              </View>
              <Icon name="navigate-next" size={25} style={styles.iconInd} />
            </View>
          </TouchableOpacity>
        </View> */}

        <ButtonCar onPress={cad}>
          <ButtonCarText>{t('insertNewCar')}</ButtonCarText>
        </ButtonCar>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5,
  },

  safeAreaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  container: {
    width: '90%',
    height: 120,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  containerTwo: {
    width: '90%',
    height: 80,
    flexDirection: 'row',
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },
  containerThree: {
    width: '90%',
    height: 50,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.GRADIENTE_GREY_BOX,
    alignSelf: 'center',
  },

  containCar: {
    flexDirection: 'column',
    marginTop: 12,
  },

  title: {
    marginTop: 10,
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  carName: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  activeBadge: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    color: Colors.BLACK,
    position: 'absolute',
    bottom: 10,
    right: 10
  },

  placa: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 10,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },

  value: {
    bottom: 10,
    paddingRight: 20,
    position: 'absolute',
    width: '100%',
    textAlign: 'right',
    fontSize: Typography.FONT_SIZE_30,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  subTitle: {
    marginTop: 20,
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 60,
    width: '100%',
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  sub: {
    marginTop: 20,
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 25,
    width: '100%',
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  titleStreet: {
    marginTop: 20,
    marginRight: 10,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY_TEXT,
  },
  line: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },

  box: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 10,
  },

  containButton: {
    marginTop: 15,
    height: '100%',
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button2: {
    flexDirection: 'row',
  },

  history: {
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },

  iconNext: {
    color: Colors.BLACK,
    marginRight: 5,
  },

  iconCar: {
    // color: Colors.BLACK,
    width: 45,
    height: 40,
    marginTop: 20,
    marginLeft: 20,
  },
  iconInd: {
    color: Colors.BLACK,
    textAlign: 'right',
    width: '50%',
    marginTop: 25,
  },

  hands: {
    color: Colors.BLACK,
    marginLeft: 20,
  },
  balance: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_20,
    marginRight: 50,
    marginLeft: 50,
  },

  containGain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CarsContain;
