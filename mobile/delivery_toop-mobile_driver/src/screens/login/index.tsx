/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Animated,
  Dimensions,
  BackHandler,
  Platform,
  Keyboard,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/core';
import { CustomModal } from '../../components/Modal';
import { useTranslation } from 'react-i18next';

import {
  Container,
  Header,
  ImageLogo,
  ContentButton,
  TouchButtonLogin,
  TxtButtonLogin,
  TouchRegister,
  TxtRegister,
  InputLogin,
  ContainerScroll,
  TextVersion,
  ForgotPasswordView,
  ForgotPasswordTouch,
  ForgotPasswordTxt,
} from './styles';
import logo from '../../assets/images/logo.png';

import pkg from '../../../package.json';

/** contexto */
import { iSettings, useSettings } from '../../context/settings';

/** Service */
import { authLogin } from '../../services/provider/auth/auth';
import { Colors } from '../../styles';

const { width } = Dimensions.get('window');

type LoginTypes = {
  navigation: any;
};

const Login = ({ navigation }: LoginTypes) => {
  const dispatch = useDispatch();
  const settings: iSettings = useSettings();
  const { t } = useTranslation();

  const {
    authUser: { user = null },
  }: any = useSelector((state: any) => state);

  let SlideLogo = new Animated.Value(0);
  let SlideInputs = new Animated.Value(0);

  const initialPositionLogoWidth = width / 4;
  const initialPositionInputWidth = width - 42;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstAnimation, setFirstAnimation] = useState(true);
  const [secondAnimation, setSecondAnimation] = useState(false);
  const [activeKeyboard, setActiveKeyboard] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      dispatch({
        type: 'SET_USER_SAGA',
        payload: {},
      });

      // Disable Go Back
      BackHandler.addEventListener('hardwareBackPress', () => {
        return true;
      });

      Keyboard.addListener('keyboardDidShow', () => {
        setActiveKeyboard(true);
      });

      Keyboard.addListener('keyboardDidHide', () => {
        setActiveKeyboard(false);
      });

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', () => {
          return true;
        });
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (user?.jwtToken) {
        // console.log('token antes splash', user?.jwtToken);
        return navigation.navigate('Splash');
      }
    }, [user?.jwtToken]),
  );

  const authUser = async () => {
    const respAuth: any = await authLogin({
      email: `${email}`.toLowerCase(),
      password,
      type: 'driver',
    });

    if (!respAuth || respAuth.errMessage) {
      setShowModal(true);
      setMessage(respAuth.errMessage);
      return;
    }

    dispatch({
      type: 'SET_USER_SAGA',
      payload: respAuth.user,
    });
  };

  function initAnimationLogin() {
    Animated.timing(SlideLogo, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // setTimeout(() => {
    setFirstAnimation(false);
    setSecondAnimation(true);
    // }, 500);
  }

  function closeLogin() {
    Animated.timing(SlideLogo, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    setSecondAnimation(false);
    setFirstAnimation(true);
  }

  useEffect(() => {
    Animated.timing(SlideInputs, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [secondAnimation]);

  return (
    <Container>
      {!activeKeyboard ? (
        <Header
          source={require('../../assets/images/loginBg.png')}
          resizeMode={'cover'}
        />
      ) : null}

      {firstAnimation && (
        <Animated.View
          style={{
            transform: [
              {
                translateX: SlideLogo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [initialPositionLogoWidth, -0],
                }),
              },
            ],
            // marginTop: 30,
            width: '90%',
            // height: 60,
          }}>
          <ImageLogo source={logo} resizeMode={'contain'} />
          <TextVersion>
            Versão {Platform.OS === 'android' ? pkg.version : pkg.versionIOS}
          </TextVersion>
        </Animated.View>
      )}

      {secondAnimation && (
        <Animated.View
          style={{
            transform: [
              {
                translateX: SlideInputs.interpolate({
                  inputRange: [0, 1],
                  outputRange: [initialPositionInputWidth, 0],
                }),
              },
            ],
            marginTop: 20,
            width: '100%',
            paddingHorizontal: 20,
            alignItems: 'center',
          }}>
          <InputLogin
            placeholder="Email"
            placeholderTextColor={Colors.BLACK}
            value={email}
            onChangeText={value => {
              const txtEmail = `${value}`.trim();
              setEmail(txtEmail);
            }}
            autoCapitalize="none"
          />
          <InputLogin
            placeholder="Senha"
            placeholderTextColor={Colors.BLACK}
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />

          <ForgotPasswordView>
            <ForgotPasswordTouch
              onPress={() => {
                navigation.navigate('ForgotPassword');
              }}>
              <ForgotPasswordTxt>Esqueci a Senha</ForgotPasswordTxt>
            </ForgotPasswordTouch>
          </ForgotPasswordView>
        </Animated.View>
      )}
      {/* <View style={{ minHeight: 60 }}></View> */}
      <SafeAreaView style={{ flex: 1 }}>
        <ContentButton>
          {firstAnimation ? (
            <TouchRegister onPress={() => navigation.navigate('Register')}>
              <TxtRegister>{t('login.register')}</TxtRegister>
            </TouchRegister>
          ) : (
            <TouchRegister onPress={() => closeLogin()}>
              <TxtRegister>CANCELAR</TxtRegister>
            </TouchRegister>
          )}

          <TouchButtonLogin
            onPress={() => {
              firstAnimation ? initAnimationLogin() : authUser();
            }}>
            <TxtButtonLogin>{t('login.enter')}</TxtButtonLogin>
          </TouchButtonLogin>
        </ContentButton>
      </SafeAreaView>
      <View style={{ flex: 1 }} />

      <CustomModal
        isVisible={showModal}
        setModalVisible={setShowModal}
        message={message}
      />
    </Container>
  );
};

export default Login;
