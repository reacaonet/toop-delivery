/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useState} from 'react';
import {View, StyleSheet, Image, Text, Dimensions} from 'react-native';
// import { useSelector } from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {Typography, Colors} from '../../../../styles';

/** Service */
import {listMessage} from '../../../../services/provider/message/list';

const Message = ({booking, driverSelf}) => {
  const [message, setMessages] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (!booking?._id) {
        return;
      }

      listMessage(booking?._id).then(result => {
        if (result && Array.isArray(result)) {
          setMessages(result);
        } else {
          setMessages([]);
        }
      });
    }, [booking]),
  );

  return (
    <View style={styles.centeredView}>
      {message && Array.isArray(message)
        ? message.map(chatMessage => (
            <>
              {chatMessage?.sent === 'driver' ? (
                <View style={styles.containerReceiveMessages}>
                  {driverSelf.length > 0 ? (
                    <Image
                      source={{uri: driverSelf[0]}}
                      style={styles.receiveImage}
                      resizeMethod="auto"
                      resizeMode="cover"
                    />
                  ) : null}

                  <View style={styles.containerReceive}>
                    <Text style={styles.receiveMessage}>
                      {chatMessage.message}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.containerSentMessages}>
                  <View style={styles.containerSent}>
                    <Text style={styles.sentMessage}>
                      {chatMessage.message}
                    </Text>
                  </View>
                </View>
              )}
            </>
          ))
        : null}
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  centeredView: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
  },
  containerSentMessages: {
    alignItems: 'flex-end',
    paddingBottom: 5,
  },

  containerReceiveMessages: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 5,
    flexDirection: 'row',
  },

  containerSent: {
    alignItems: 'flex-end',

    width: Dimensions.get('screen').width / 2 + 20,
    maxWidth: Dimensions.get('screen').width / 2 + 20,
    minWidth: Dimensions.get('screen').width / 2 + 20,
  },

  containerReceive: {
    alignItems: 'flex-start',

    width: Dimensions.get('screen').width - 50,
    maxWidth: Dimensions.get('screen').width - 50,
    minWidth: Dimensions.get('screen').width - 50,
  },

  receiveImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 6,
  },

  sentMessage: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_14,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 15,
    paddingVertical: 10,

    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 6,
  },

  receiveMessage: {
    color: Colors.BLACK,
    fontSize: Typography.FONT_SIZE_14,
    backgroundColor: Colors.GRAY_MEDIUM,
    paddingHorizontal: 15,
    paddingVertical: 10,

    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
});
