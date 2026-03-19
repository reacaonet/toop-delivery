import React, { useState } from 'react';
import { Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

/** Styles */
import {
  Container,
  Header,
  HeaderTitle,
  HeaderIconTouch,
  HeaderIcon,
  Content,
  InputPasswordContent,
  IconInput,
  InputText,
  ContentButton,
  TouchButton,
  TxtButton,
} from './styles';
import { Colors } from '../../styles';

/** components */
import { CustomModal } from '../../components/Modal';

/** Services */
import {
  generateResetPassword,
  resetPassword,
} from '../../services/provider/user/resetPassword';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [informCode, setInformCode] = useState(false);
  const [load, setLoad] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [passVisible, setPassVisible] = React.useState(false);
  const [confirmVisible, setConfirmVisible] = React.useState(false);

  const sendEmail = async () => {
    const txtEmail = `${email}`.toLowerCase().trim();
    setLoad(true);

    const response = await generateResetPassword({
      type: 'driver',
      email: txtEmail,
    });

    setLoad(false);

    if (response.errMessage) {
      setShowModal(true);
      setMessage(response.errMessage);
      return;
    }

    dispatch({
      type: 'SET_MESSAGE_SAGA',
      payload: {
        title: '',
        description: 'Informe o código enviado por E-mail',
      },
    });
    setInformCode(true);
  };

  const sendResetPassword = async () => {
    if (!code) {
      setShowModal(true);
      setMessage('Informe o código enviado por E-mail');
      return;
    }

    if (!password || !confirmPassword) {
      setShowModal(true);
      setMessage('Informe a senha e a confirmação senha');
      return;
    }

    if (password !== confirmPassword) {
      setShowModal(true);
      setMessage('Ops! As senhas não conferem. Verifique e tente novamente.');
      return;
    }

    const txtEmail = `${email}`.toLowerCase().trim();

    setLoad(true);
    const response = await resetPassword({
      type: 'driver',
      email: txtEmail,
      code: code,
      password: password,
    });
    setLoad(false);

    if (response.errMessage) {
      setShowModal(true);
      setMessage(response.errMessage);
      return;
    }

    dispatch({
      type: 'SET_MESSAGE_SAGA',
      payload: {
        title: '',
        description: 'Senha alterada com sucesso!!',
      },
    });
    navigation.navigate('Login');
  };

  return (
    <Container>
      <CustomModal
        isVisible={showModal}
        setModalVisible={setShowModal}
        message={message}
      />

      <Header>
        <HeaderIconTouch onPress={() => navigation.navigate('Login')}>
          <HeaderIcon name="keyboard-arrow-left" size={30} />
        </HeaderIconTouch>
        <HeaderTitle>Alterar Senha</HeaderTitle>
      </Header>
      <Content behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {!informCode ? (
          <InputText
            placeholder="Email"
            placeholderTextColor={Colors.BLACK}
            autoCapitalize="none"
            value={email}
            onChangeText={value => {
              setEmail(value);
            }}
          />
        ) : null}

        {informCode ? (
          <>
            <InputText
              placeholder="Código"
              placeholderTextColor={Colors.BLACK}
              autoCapitalize="none"
              value={code}
              onChangeText={value => {
                setCode(value);
              }}
            />

            <InputPasswordContent>
              <InputText
                placeholder="Senha"
                placeholderTextColor={Colors.BLACK}
                autoCapitalize="sentences"
                value={password}
                secureTextEntry={!passVisible}
                onChangeText={value => {
                  setPassword(value);
                }}
              />
              <IconInput
                name={!passVisible ? 'visibility' : 'visibility-off'}
                size={25}
                onPress={() => {
                  setPassVisible(!passVisible);
                }}
              />
            </InputPasswordContent>

            <InputPasswordContent>
              <InputText
                placeholder="Confirmar Senha"
                placeholderTextColor={Colors.BLACK}
                autoCapitalize="sentences"
                value={confirmPassword}
                secureTextEntry={!confirmVisible}
                onChangeText={value => {
                  setConfirmPassword(value);
                }}
              />
              <IconInput
                name={!confirmVisible ? 'visibility' : 'visibility-off'}
                size={25}
                onPress={() => {
                  setConfirmVisible(!confirmVisible);
                }}
              />
            </InputPasswordContent>
          </>
        ) : null}

        <ContentButton>
          <TouchButton
            disabled={load}
            onPress={() => {
              if (!informCode) {
                sendEmail();
              } else {
                sendResetPassword();
              }
            }}>
            {!load ? (
              <TxtButton>Confirmar</TxtButton>
            ) : (
              <ActivityIndicator size={'small'} color={Colors.WHITE} />
            )}
          </TouchButton>
        </ContentButton>
      </Content>
    </Container>
  );
};

export default ForgotPassword;
