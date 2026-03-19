/* eslint-disable prettier/prettier */
import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import {Typography, Colors} from '../../../styles';
// import { Container } from './styles';

/** Service */
import {listConversations} from '../../../services/provider/message/list';

const Message = ({nav}) => {
  const navigation = useNavigation();

  const {
    user: {user = null},
  } = useSelector(state => state);

  const [conversations, setConversations] = useState([]);

  useFocusEffect(
    useCallback(() => {
      listConversations(user.passenger?._id).then(result => {
        if (result && Array.isArray(result) && result.length > 0) {
          setConversations(result);
        } else {
          setConversations([]);
        }
      });
    }, [user.passenger]),
  );

  return (
    <View style={styles.centeredView}>
      <FlatList
        data={conversations}
        keyExtractor={item => item._id}
        style={styles.flatStyle}
        renderItem={({item}) => (
          <View style={styles.container}>
            {item?.driver?.selfiePhoto &&
            Array.isArray(item?.driver?.selfiePhoto) &&
            item?.driver?.selfiePhoto.length > 0 ? (
              <Image
                style={styles.image}
                source={{
                  uri: item?.driver?.selfiePhoto[0],
                }}
              />
            ) : (
              <Image
                style={styles.image}
                source={require('../../../assets/images/photo.png')}
              />
            )}

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Conversation', {
                  booking: item?.booking,
                  goBack: null,
                });
              }}>
              <View style={styles.atribute}>
                <Text style={styles.name}>{item?.driver?.name}</Text>
                <Text style={styles.car}>
                  {item?.driver?.vehicleManufacturer}{' '}
                  {item?.driver?.vehicleModel} {item?.driver?.vehicleColor}
                </Text>
                <Text style={styles.car}>{item?.driver?.vehicleNameplate}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* <View style={styles.container}>
        <Image
          style={styles.image}
          source={require('../../../assets/images/men.png')}
        />

        <View style={styles.atribute}>
          <Text style={styles.name}>DIEGO MARQUES</Text>
          <Text style={styles.car}>Volkswagen Gol Cinza</Text>
          <Text style={styles.car}>QQK-8645</Text>
        </View>
      </View> */}
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  centeredView: {
    // flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    height: '100%',
  },
  flatStyle: {
    width: '90%',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'justify',
    marginLeft: 10,
    color: Colors.RED,
  },
  modalText2: {
    marginBottom: 15,
    textAlign: 'justify',
    marginLeft: 10,
    color: Colors.GRAY,
  },
  image: {
    marginTop: 5,
    marginLeft: 5,
    borderRadius: 8,
    width: 80,
    height: 80,
  },

  name: {
    marginLeft: 10,
    marginTop: 10,
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.PRIMARY,
  },
  car: {
    marginLeft: 10,
    marginTop: 10,
    fontSize: Typography.FONT_SIZE_13,
  },
  container: {
    height: 100,
    width: '100%',
    marginTop: 20,
    flexDirection: 'row',
    backgroundColor: Colors.GRAY_LIGHT,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: 8,
    borderWidth: 1,
  },

  atribute: {
    flexDirection: 'column',
  },
});
