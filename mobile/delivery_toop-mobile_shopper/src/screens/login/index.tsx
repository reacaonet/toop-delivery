import React, {useState, FunctionComponent} from 'react';
import {
  StatusBar,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import {AlertModal} from '../../components/shared/modals';
import InputText from '../../components/shared/input/inputText';
import ButtonPrimary from '../../components/shared/button/ButtonPrimary';
import {useDispatch} from 'react-redux';
import auth from '../../services/provider/person/auth';

import {
  Container,
  LogoWrapper,
  Logo,
  ButtonWrapper,
  Row,
  styles,
  RowVersion,
  TextVersion,
} from './styles';

import logo from '../../assets/images/logoBranca.png';
import {Colors, Typography} from './../../styles';

type LoginProps = {
  navigation: any;
};

const Login: FunctionComponent<LoginProps> = ({navigation}) => {
  let passwordInput = React.useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadBtn, setLoadBtn] = useState(false);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [modalIsVisibleText, setModalIsVisibleText] = useState(
    'Login ou senha inválido!',
  );

  const dispatch = useDispatch();

  const goAuth = async () => {
    setLoadBtn(true);
    const resp: any = await auth(`${email.trim()}`, `${password}`, 'shopper');
    setLoadBtn(false);

    if (resp.error === true) {
      setModalIsVisibleText(resp.message ?? 'Login ou senha inválido!');
      setModalIsVisible(true);
      return;
    }

    onSetAuth(resp);
  };

  const onSetAuth = (payload: any) => {
    dispatch({type: 'SET_USER_SAGA', payload: payload});
  };

  return (
    <>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="transparent"
      />
      {/* <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled> */}
      <Container>
        <AlertModal
          title="alerta"
          {...{modalIsVisible}}
          onPress={() => setModalIsVisible(false)}
          description={modalIsVisibleText}
        />

        <LogoWrapper>
          <Logo source={logo} resizeMethod="scale" resizeMode="stretch" />
        </LogoWrapper>

        <View style={{padding: 25}}>
          <Row>
            <View style={styles.container}>
              <Text style={styles.title}>E-mail</Text>

              <TextInput
                style={styles.textInput}
                onChangeText={setEmail}
                autoCapitalize={'none'}
                underlineColorAndroid={'transparent'}
                onSubmitEditing={() => passwordInput?.current?.focus()}
                value={email}
                placeholderTextColor="black"
                keyboardType="email-address"
                placeholder="Informe um E-mail"
              />
            </View>
          </Row>
          <Row>
            <View style={styles.container}>
              <Text style={styles.title}>Senha</Text>

              <TextInput
                ref={passwordInput}
                style={styles.textInput}
                onChangeText={setPassword}
                autoCapitalize={'none'}
                underlineColorAndroid={'transparent'}
                value={password}
                placeholderTextColor="black"
                secureTextEntry={true}
                placeholder="Informe sua senha"
              />
            </View>
          </Row>
          <ButtonWrapper>
            <ButtonPrimary title="Entrar" onPress={goAuth} load={loadBtn} />
          </ButtonWrapper>
        </View>
      </Container>
      {/* </KeyboardAvoidingView> */}
    </>
  );
};

export default Login;
