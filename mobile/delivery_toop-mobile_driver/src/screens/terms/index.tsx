import React from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from './styles';

/** Components */
import Terms from './components/screenTerms';

/** Service */
import { updatePreRegistration } from '../../services/provider/preRegistration/update';
import { StorageClean } from '../../services/deviceStorage';

interface Props {
  navigation?: any;
}

const ScreenTerm = () => {
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const { preRegistration } = useSelector((state: any) => state);

  function handleGoBack() {
    navigation.goBack('ConfirmPassword');
  }

  async function submit() {
    try {
      let response: any;
      response = await updatePreRegistration(preRegistration?.id, {
        terms: true,
      });

      if (!response) {
        return Alert.alert('Termos', 'Não foi possível aceitar os termos');
      }

      if (response && response.errMessage) {
        return Alert.alert('Termos', response.errMessage);
      }

      await StorageClean('@pre_register');

      dispatch({
        type: 'SET_MESSAGE_SAGA',
        payload: {
          title: '',
          description:
            'Seu cadastro foi enviado com sucesso, em até 48 horas retornaremos com o resultado da análise. Obrigado.',
        },
      });

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Login',
          },
          {
            name: 'DriverMap',
          },
        ],
      });
    } catch (err) {
      Alert.alert('Termos', 'Não foi possível aceitar os termos');
    }
  }

  function exit() {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Login',
        },
      ],
    });
  }

  return (
    <Container>
      <Terms exit={exit} submit={submit} goBack={handleGoBack} />
    </Container>
  );
};

export default ScreenTerm;
