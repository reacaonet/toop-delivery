/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback} from 'react';

import {
  Text,
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

import {updatePersonOne} from '../../../services/service/Person/update';

import {Typography, Colors} from '../../../styles';
import {CustomModal} from '../../../components/Modal';
import {StorageClean, StorageGet} from '../../../services/deviceStorage';

const ReferralCode = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {
    user: {user = null},
  } = useSelector(state => state);

  const [code, setCode] = React.useState(user?.code ?? '');
  const [show, setShow] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [load, setLoad] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkIndication = async () => {
        const isIndication = await StorageGet('@indication');
        if (!isIndication) {
          return navigation.navigate('Genre');
        }
        setShow(true);
        StorageClean('@indication');
      };
      checkIndication();
    }, []),
  );

  const sendData = async () => {
    setLoad(true);

    const resp = await updatePersonOne(user?.person?._id, {
      code: code,
    });

    setLoad(false);

    if (resp.errMessage) {
      setMessage(resp.errMessage);
      setShowModal(true);
      return;
    }

    return navigation.navigate('Genre');
  };

  const sendJump = () => {
    return navigation.navigate('Genre');
  };

  return (
    <>
      <View style={styles.container}>
        {show ? (
          <>
            <SafeAreaView style={styles.safeAreaView}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon
                  name="navigate-before"
                  size={40}
                  style={styles.iconGoBack}
                />
              </TouchableOpacity>
            </SafeAreaView>
            <KeyboardAvoidingView>
              <View style={styles.center}>
                <View style={styles.loginPhoneContainer}>
                  <Text style={styles.title}>
                    Possui algum{' '}
                    <Text style={styles.sub}>código de indicação ?</Text>
                  </Text>
                </View>
                <TextInput
                  style={styles.inputPhone}
                  onSubmitEditing={() => sendData()}
                  placeholder=""
                  value={code}
                  onChangeText={value => setCode(value)}
                  autoCapitalize="sentences"
                  autoFocus
                  keyboardType="default"
                />
              </View>
            </KeyboardAvoidingView>
            <CustomModal
              isVisible={showModal}
              setModalVisible={setShowModal}
              message={message}
            />

            <View style={styles.buttonsHorizontal}>
              <TouchableOpacity
                disabled={load}
                style={[styles.button, styles.styleJump]}
                onPress={() => sendJump()}>
                <Text style={styles.buttonText}>Pular</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={load}
                style={styles.button}
                onPress={() => sendData()}>
                {!load ? (
                  <Text style={styles.buttonText}>Continuar</Text>
                ) : (
                  <ActivityIndicator size={'small'} color={Colors.WHITE} />
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: Colors.WHITE,
    padding: 6,
  },
  iconGoBack: {
    color: Colors.BLACK,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  loginPhoneContainer: {
    width: '90%',
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
    borderLeftColor: Colors.GRAY,
    borderLeftWidth: 1,
    borderStyle: 'solid',
    backgroundColor: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    lineHeight: Typography.FONT_SIZE_16,
  },
  safeAreaView: {
    marginTop: 20,
  },
  button: {
    width: '47%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 90,
    backgroundColor: Colors.BLACK,
  },
  buttonsHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    lineHeight: Typography.FONT_SIZE_16,
  },
  styleJump: {
    backgroundColor: Colors.GRAY_MEDIUM,
    elevation: 2,
  },
});

export default ReferralCode;
