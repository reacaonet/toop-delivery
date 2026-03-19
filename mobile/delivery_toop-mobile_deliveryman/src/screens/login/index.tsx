import React, {useState, FunctionComponent, useEffect} from 'react';
import {
  StatusBar,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';

import {AlertModal} from '../../components/shared/modals';
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
import InputText from '../../components/shared/input/inputText';
import ButtonPrimary from '../../components/shared/button/ButtonPrimary';
import logo from '../../assets/images/icone.png';
import auth from '../../services/provider/person/auth';
import {StorageClean} from '../../services/deviceStorage';
import packageJson from '../../../package.json';

type LoginProps = {
  navigation: any;
  onSetAuth: Function;
};

const Login: FunctionComponent<LoginProps> = ({
  navigation,
  onSetAuth,
}: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadBtn, setLoadBtn] = useState(false);
  const [modalIsVisible, setModalIsVisible] = useState(false);

  useEffect(() => {
    navigation.closeDrawer();
  }, [navigation]);

  const goAuth = async () => {
    setLoadBtn(true);
    const resp: any = await auth(`${email}`, `${password}`, 'deliveryMan');
    setLoadBtn(false);

    if (resp === false) {
      setModalIsVisible(true);
      return;
    }

    onSetAuth(resp);
  };

  const goRegister = async () => {
    await StorageClean('Register');

    navigation.navigate('Register', {screen: 'Register'});
  };

  return (
    <>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled>
        <Container>
          <AlertModal
            title="alerta"
            {...{modalIsVisible}}
            onPress={() => setModalIsVisible(false)}
            description="Login ou senha inválido!"
          />

          <LogoWrapper>
            <Logo source={logo} />
          </LogoWrapper>

          <Row>
            <InputText
              title="E-mail"
              value={email}
              setValue={setEmail}
              autoCapitalize="none"
              placeholder="Informe um E-mail"
              autoCompleteType="email"
              autoCorrect={false}
            />
          </Row>
          <Row>
            <InputText
              title="Senha"
              value={password}
              setValue={setPassword}
              autoCapitalize="none"
              placeholder="Informe uma senha"
              autoCompleteType="password"
              autoCorrect={false}
              secureTextEntry={true}
            />
          </Row>
          <ButtonWrapper>
            <ButtonPrimary title="Autenticar" onPress={goAuth} load={loadBtn} />
          </ButtonWrapper>

          <Text style={styles.txt}>
            Que ganhar um extra entregando delivery?
          </Text>
          <TouchableOpacity onPress={() => goRegister()}>
            <Text style={styles.txtClick}>Faça seu cadastro</Text>
          </TouchableOpacity>
        </Container>
        <RowVersion>
          <TextVersion>{`Versão: ${packageJson.version}`}</TextVersion>
        </RowVersion>
      </KeyboardAvoidingView>
    </>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetAuth: (payload: any) =>
      dispatch({type: 'SET_USER_SAGA', payload: payload}),
  };
};

export default connect(null, mapDispatchToProps)(Login);
