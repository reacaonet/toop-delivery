import React from 'react';

import {
  Text,
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

import { updatePreRegistration } from '../../../services/provider/preRegistration/update';
import { listCities } from '../../../services/provider/city/list';
import { Typography, Colors } from '../../../styles';

interface Props { }

const Region: React.FC<Props> = ({ }) => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const state: any = useSelector((state: any) => state?.preRegistration);

  const [franchise, setFranchise] = React.useState(state?.franchise ?? '');
  const [data, setData] = React.useState([]);

  const sendData = async () => {
    if (franchise === null) {
      return Alert.alert('Região', 'Informe uma região');
    }

    const id = state?.id;

    const objectTosend = {
      franchise: franchise,
    };

    try {
      const response = await updatePreRegistration(id, objectTosend);
      if (response && response.errMessage) {
        return Alert.alert('Cadastro', response.errMessage);
      }

      dispatch({
        type: 'SET_REGISTRATION',
        payload: {
          ...state,
          id: id,
          franchise: franchise,
        },
      });

      navigation.navigate('Register', { screen: 'ImageSelf' });
    } catch (error) {
      console.log(error, ' error');
    }
  };

  const loadCities = async () => {
    const response = await listCities({ hasFranchise: true });

    setData(response);
  };

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.franchise !== '' && franchise === item.franchise) {
            setFranchise('');
          } else {
            setFranchise(item.franchise);
          }
        }}
        style={[
          styles.item,
          franchise === item.franchise
            ? { backgroundColor: Colors.GRAY_MAX_DARK }
            : {},
        ]}>
        <Text>
          {item?.name}/{item?.state?.uf}
        </Text>
      </TouchableOpacity>
    );
  };

  React.useEffect(() => {
    loadCities();
  }, []);

  return (
    <>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.center}>
          <View style={styles.loginPhoneContainer}>
            <Text style={styles.title}>Selecione a região de cobertura</Text>
          </View>
          <FlatList
            style={styles.flatStyle}
            data={data}
            refreshing
            renderItem={renderItem}
            keyExtractor={(item: any) => item._id}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          />
          {franchise ? (
            <TouchableOpacity style={[styles.guest]} onPress={() => sendData()}>
              <Text style={styles.guestText}>CONTINUAR</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 7,
  },
  iconGoBack: {
    color: Colors.BLACK,
  },
  center: {
    flex: 1,
    marginTop: 25,
  },
  loginPhoneContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  item: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: Colors.GRAY_LIGHT,
    borderRadius: 5,
  },
  title: {
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLACK,
  },
  sub: {
    fontSize: Typography.FONT_SIZE_17,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  inputPhone: {
    color: Colors.BLACK,
    marginTop: 30,
    alignSelf: 'flex-start',
    width: '90%',
    padding: 5,
    marginLeft: 15,
    borderBottomColor: Colors.GRAY,
    borderBottomWidth: 0.7,
    borderStyle: 'solid',
    backgroundColor: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    lineHeight: Typography.FONT_SIZE_16,
  },
  safeAreaView: {
    marginTop: 20,
  },
  keyboardStyle: {
    flex: 1,
  },
  flatStyle: {
    flexGrow: 0,
    width: '90%',
    height: '85%',
    paddingTop: 20,
    alignSelf: 'center',
  },
  guest: {
    flex: 1,
    width: '90%',
    marginLeft: '5%',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    height: 45,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -5,
    zIndex: 9999,
  },
  guestText: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.WHITE,
    letterSpacing: 1,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
  },
});

export default Region;
