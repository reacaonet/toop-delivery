/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Typography, Colors } from '../../../styles';
// import { Container } from './styles';

/** Service */
import { listConversations } from '../../../services/provider/message/list';

interface Props {
  nav: any;
}

const Message: React.FC<Props> = ({ nav }) => {
  const navigation = useNavigation<any>();

  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  const [conversations, setConversations] = useState<any>([]);

  useFocusEffect(
    useCallback(() => {
      listConversations(user?._id).then(result => {
        if (result && Array.isArray(result) && result.length > 0) {
          setConversations(result);
        } else {
          setConversations([]);
        }
      });
    }, [user]),
  );

  return (
    <View style={styles.centeredView}>
      <FlatList
        data={conversations}
        keyExtractor={item => item._id}
        style={styles.flatStyle}
        renderItem={({ item }: any) => (
          <View style={styles.container}>
            {item?.passenger?.person?.image ? (
              <Image
                style={styles.image}
                source={{
                  uri: item?.passenger?.person?.image,
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
                <Text style={styles.name}>{item?.passenger?.person?.name}</Text>
                <Text style={styles.car}>{item?.passenger?.person?.phone}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  centeredView: {
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
    color: Colors.GRAY_TEXT,
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
