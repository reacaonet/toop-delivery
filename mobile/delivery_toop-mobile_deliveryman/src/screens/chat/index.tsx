/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Keyboard,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import database from '@react-native-firebase/database';

import CustomHeader from '../../components/shared/CustomHeader';
import {useFocusEffect} from '@react-navigation/native';
import styles from './styles';
import headerAvatar from '../../assets/images/headerAvatar.png';
import {MessageItem, ChatImage, ChatImageLoad, InputBar} from './components';

import {
  listChat,
  createChatImage,
  chatMessage as messageSend,
} from '../../services/provider/chat';
import getCustomer from '../../services/provider/person/customer';
import {updateRead} from '../../services/provider/chat';
import {chooseImage} from './components/chatUtils';
import config from '../../config';

type chatProps = {
  close: any;
  deliveryMan: any;
  order: any;
  totalMessage: any;
};

const Chat: React.FC<chatProps> = ({
  deliveryMan,
  order,
  close,
  totalMessage,
}: chatProps) => {
  const [chatMessages, setChatMessages]: any = useState([]);
  const [message, setMessage] = useState('');
  const [customer, setCustomer]: any = useState({});
  const [person] = useState('deliveryMan');
  const [personSend] = useState('customer');

  useFocusEffect(
    useCallback(() => {
      initState();
    }, []),
  );

  useEffect(() => {
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
    };
  }, []);

  useEffect(() => {
    const companyId =
      order && order.company && order.company._id
        ? order.company._id
        : undefined;

    if (companyId) {
      const chatCart = database()
        .ref(`${config.FIREBASE_PATH}chat/company/${companyId}`)
        .on('value', (snapshot: any) => {
          if (snapshot.val()) {
            getMessages();
          }
        });

      return () =>
        database()
          .ref(`${config.FIREBASE_PATH}chat/company/${companyId}`)
          .off('value', chatCart);
    }
  }, [order]);

  // Envia mensagem no primeiro click
  const _keyboardDidHide = () => {
    if (message && message.length >= 1) {
      sendMessage();
    }
  };

  const initState = async () => {
    if (order && order.customer && order.customer._id) {
      let respCustomer = await getCustomer(order.customer._id);
      if (respCustomer && respCustomer._id) {
        setCustomer(respCustomer);
      }
    }

    await getMessages();
  };

  const getMessages = async () => {
    try {
      const respMensagem = await listChat({
        cart: order.shoppingCart,
        person: person,
        personSend: personSend,
      });

      if (respMensagem) {
        setChatMessages(respMensagem);
      }

      if (order && deliveryMan._id) {
        updateRead(deliveryMan._id, order.shoppingCart);
      }
    } catch (err) {
      console.log('Fail Get Messages', err);
    }
  };

  const goBack = () => {
    totalMessage(0);
    close(false);
  };

  const selectImage = async () => {
    chooseImage()
      .then((response: any) => {
        sendImage(response.source.uri, response.type);
      })
      .catch((err) => {
        console.log('Fail ChooseImage', err);
      });
  };

  const sendMessage = async () => {
    if (!message || message.length <= 1) {
      Alert.alert('Oops', 'Informe um mensagem');
      return;
    }

    const messageAtual = message;
    Keyboard.dismiss();

    setMessage('');
    let respMessage = await messageSend({
      type: 'text',
      message: messageAtual,
      shoppingCart: order.shoppingCart,
      personId: deliveryMan._id,
      person: person,
      personSendId: order.customer?._id,
      personSend: personSend,
    });

    if (!respMessage) {
      Alert.alert('Oops', 'Não foi possível enviar Mensagem ...');
    }
  };

  const sendImage = async (file: any, dataType: any) => {
    try {
      setChatMessages([
        {
          _id: `${Math.random()}`,
          type: 'image_load',
        },
        ...chatMessages,
      ]);

      await createChatImage({
        type: 'image',
        message: 'image',
        folder: 'chat_cart',
        file: file,
        dataType: dataType,
        shoppingCart: order.shoppingCart,
        personId: deliveryMan._id,
        person: person,
        personSendId: order.customer?._id,
        personSend: personSend,
      });
    } catch (err) {
      console.log('Err sendImage', err);
    }
  };

  const renderItem = (item: any) => {
    return (
      <>
        {item && item.type && item.type === 'text' ? (
          <MessageItem item={item} />
        ) : null}

        {item && item.type && item.type === 'image' ? (
          <ChatImage item={item} />
        ) : null}

        {item && item.type && item.type === 'image_load' ? (
          <ChatImageLoad />
        ) : null}

        {item && item.type && item.type === 'text_alert' ? (
          <View style={styles.textAlertContainer}>
            <Text style={styles.textAlert}>{item.message}</Text>
          </View>
        ) : null}
      </>
    );
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{flex: 1}}>
          <View style={styles.container}>
            <CustomHeader
              closeChat={goBack}
              title="cliente:"
              avatarImg={headerAvatar}
              subtitle={customer?.person?.name ? customer?.person?.name : ''}
            />

            <FlatList
              initialNumToRender={chatMessages ? chatMessages.length : 0}
              inverted
              style={styles.flatStyle}
              data={chatMessages}
              keyExtractor={(item: any) => `${item._id}`}
              renderItem={({item}) => renderItem(item)}
            />
            <SafeAreaView>
              <InputBar
                onchangeText={setMessage}
                senderType={message.length ? 'text' : 'audio'}
                onSubmitEditing={sendMessage}
                onSubmitImage={selectImage}
                value={message}
              />
            </SafeAreaView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Chat;
