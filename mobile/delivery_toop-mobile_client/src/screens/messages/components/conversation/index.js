/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useState} from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  FlatList,
  ImageBackground,
} from 'react-native';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import database from '@react-native-firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Send from 'react-native-vector-icons/Ionicons';
import {Typography, Colors} from '../../../../styles';
import {Input} from 'react-native-elements';
import Messages from './Messages';

/** Service */
import {listOneBooking} from '../../../../services/provider/booking/list';
import {crateMessage} from '../../../../services/provider/message/create';
import config from '../../../../config';

import logo from '././../../../../assets/images/email.png';

const Conversation = ({navigation}) => {
  const route = useRoute();

  const [bookingId] = useState(route?.params?.booking || '');
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [load, setLoad] = useState(false);
  const [goBack, setGoBack] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (!bookingId) {
        return;
      }

      getMessages();
    }, [bookingId]),
  );

  useFocusEffect(
    useCallback(() => {
      if (booking?._id) {
        database()
          .ref(`${config.FIREBASE_PATH}chatRace/${booking?._id}`)
          .on('value', snapshot => {
            var value = snapshot.val();
            if (value) {
              getMessages();
            }
          });
      }
    }, [booking?._id]),
  );

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.goBack) {
        setGoBack(route?.params?.goBack);
      } else {
        setGoBack(null);
      }
    }, [route?.params?.goBack]),
  );

  const getMessages = () => {
    listOneBooking(bookingId).then(result => {
      if (result && result._id) {
        setBooking(result);
      } else {
        setBooking(null);
      }
    });
  };

  const sendMensage = async () => {
    if (`${message}`.length < 2) {
      return;
    }

    if (!booking && !booking._id) {
      return Alert.alert('Mensagem', 'Aguarde carregar as informações');
    }

    setLoad(true);
    await crateMessage({
      message: message,
      type: 'text',
      booking: booking._id,
      sent: 'passenger',
      receive: 'driver',
      passenger: booking?.passenger._id,
      driver: booking?.driver._id,
    });

    setMessage('');
    getMessages();
    setLoad(false);
  };

  const runBack = () => {
    console.log('goBack', goBack);

    if (goBack === 'RaceAccepted') {
      return navigation.navigate('RideAndTravelStack', {
        screen: 'RaceAccepted',
      });
    }

    return navigation.navigate('Home');
  };

  return (
    <View
      style={{
        flexDirection: 'column',
        backgroundColor: '#eee',
        height: '100%',
      }}>
      <ImageBackground
        source={logo}
        resizeMode="repeat"
        style={styles.image}
        imageStyle={{opacity: 0.08, padding: 10}}>
        <SafeAreaView style={styles.safeAreaView}>
          <TouchableOpacity onPress={() => runBack()}>
            <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>
              {booking?.driver?.name?.toUpperCase()}
            </Text>
            <Text style={styles.subtitle}>
              {booking?.driver?.vehicleManufacturer}{' '}
              {booking?.driver?.vehicleModel} {booking?.driver?.vehicleColor}
              {' - '} {booking?.driver?.vehicleNameplate}
            </Text>
          </View>
        </SafeAreaView>

        <FlatList
          data={[{title: 'Title Text', key: 'item1'}]}
          renderItem={() => (
            <Messages
              driverSelf={booking?.driver?.selfiePhoto ?? ''}
              booking={booking}
            />
          )}
        />

        <View style={styles.inputSend}>
          <Input
            placeholder="Escreva a mensagem..."
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            rightIcon={
              <TouchableOpacity onPress={() => sendMensage()} disabled={load}>
                <Send name="send-sharp" size={30} style={styles.send} />
              </TouchableOpacity>
            }
            inputContainerStyle={{borderBottomWidth: 0, width: '100%'}}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  iconGoBack: {
    color: Colors.BLACK,
    marginLeft: 5,
  },

  safeAreaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 90,
    backgroundColor: Colors.WHITE,
  },

  title: {
    fontWeight: 'bold',
    width: '90%',
    textAlign: 'right',
    fontSize: Typography.FONT_SIZE_15,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.BLUE,
  },
  subtitle: {
    marginRight: 25,
    marginTop: 5,
    fontSize: Typography.FONT_SIZE_15,
    lineHeight: Typography.FONT_SIZE_21,
    fontFamily: Typography.FONT_FAMILY_LIGHT,
    color: Colors.GRAY,
  },

  container: {
    justifyContent: 'flex-end',
    width: '100%',
    backgroundColor: 'blue',
  },

  inputSend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: Colors.WHITE,
  },

  input: {
    marginTop: 3,
    width: '70%',
    marginLeft: 20,
  },

  send: {
    color: Colors.GRAY_TEXT,
    marginTop: 7,
  },
});
