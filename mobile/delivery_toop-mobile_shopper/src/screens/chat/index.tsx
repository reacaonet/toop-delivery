/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback } from 'react';
import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  FlatList,
  Text,
  Alert,
  Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import { useNavigation, useRoute } from '@react-navigation/native';
/** Service */
import {
  listChat,
  createChatImage,
  chatMessage as messageSend,
  updateRead,
} from '../../services/provider/chat';
import config from '../../config';

/** Components */
import CustomHeader from '../../components/shared/CustomHeader';
import { MessageItem, ChatImage, ChatImageLoad, InputBar } from './components';
import { chooseImage } from './components/chatUtils';

/** Images */
import headerAvatar from '../../assets/images/headerAvatar.png';

/** Styles */
import styles from './styles';

type chatProps = {
  close: any;
  shopper: any;
  customer: any;
  order: any;
  totalMessage: any;
};

const Chat: React.FC<chatProps> = ({
  // shopper,
  // order,
  // customer,
  // close,
  // totalMessage,
}: chatProps) => {

  const { navigate, goBack } = useNavigation();
  const route = useRoute<any>();

  const [chatMessages, setChatMessages]: any = useState([]);
  const [message, setMessage] = useState('');
  const [person] = useState('shopper');
  const [personSend] = useState('customer');

  const [order, setOrders] = useState<any>({});
  const [shopper, setShopper] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [totalMessage, setTotalMessage] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setOrders(route.params?.order || {});
      setShopper(route.params?.shopper || {});
      setCustomer(route.params?.customer || {});
      setTotalMessage(route.params?.totalMessage || {});
    }, [route.params]),
  );

  useFocusEffect(
    useCallback(() => {
      if (order && order._id) {
        initState();

        database()
          .ref(`${config.FIREBASE_PATH}chat/cart/${order.shoppingCart}`)
          .on('value', (snapshot: any) => {
            if (snapshot.val()) {
              initState();
            }
          });

        return () => {
          database()
            .ref(`${config.FIREBASE_PATH}chat/cart/${order.shoppingCart}`)
            .off();
        };
      }
    }, [order]),
  );

  useFocusEffect(
    useCallback(() => {
      if (order && order._id) {
        initState();
      }

      const companyId =
        order && order?.company && order.company._id
          ? order.company._id
          : undefined;

      if (companyId) {
        database()
          .ref(`${config.FIREBASE_PATH}chat/company/${companyId}`)
          .on('value', (snapshot: any) => {
            if (snapshot.val()) {
              getMessages();
            }
          });
      }

      return () => {
        database()
          .ref(`${config.FIREBASE_PATH}chat/company/${companyId}`)
          .off();
      };
    }, [order]),
  );

  const initState = async () => {
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

      if (order && shopper?._id) {
        updateRead(shopper?.person?._id, order.shoppingCart);
      }
    } catch (err) {
      console.log('Fail Get Messages', err);
    }
  };

  // const goBack = () => {
  //   // totalMessage(0);
  //   // setTotalMessage(0);
  //   // close(false);
  // };

  const sendMessage = async () => {
    try {
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
        // personId: shopper._id,
        personId: shopper.person._id,
        person: person,
        personSendId: order.customer?._id,
        personSend: personSend,
      });

      if (!respMessage) {
        return Alert.alert('Oops', 'Não foi possível enviar Mensagem ...');
      }
    } catch (err) {
      Alert.alert('Enviar Mensagme', 'Não foi possível enviar mensagem...');
    }
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
        // personId: shopper._id,
        personId: shopper.person._id,
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}>
        <View style={styles.container}>
          <CustomHeader
            closeChat={() => goBack()}
            title="cliente:"
            avatarImg={headerAvatar}
            subtitle={customer?.person?.name}
          />

          <FlatList
            initialNumToRender={chatMessages ? chatMessages.length : 0}
            inverted
            style={styles.flatStyle}
            data={chatMessages}
            keyExtractor={(item: any) => `${item._id}`}
            renderItem={({ item }) => renderItem(item)}
          />

          <SafeAreaView>
            <InputBar
              onchangeText={setMessage}
              senderType={'text'}
              onSubmitEditing={sendMessage}
              onSubmitImage={selectImage}
              value={message}
            />
          </SafeAreaView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Chat;
