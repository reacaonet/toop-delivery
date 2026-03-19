import React from 'react';

import { Container } from './styles';

/** Components */
import ConfirmCriminal from './components/screenConfirm';
import { useSelector } from 'react-redux';
import { updatePreRegistration } from '../../services/provider/preRegistration/update';
import { fileUpload } from '../../services/sendImages/fileUpload';

interface Props {
  route: any;
  navigation: any;
}

const Confirm = ({ route, navigation }: Props) => {
  let base64 = route.params.params.data.base64;
  const uri = route.params.params.data.uri;

  let state = useSelector(state => state);

  function handleGoBack() {
    navigation.navigate('Criminal');
  }

  const submit = async () => {
    const id = state.preRegistration.id;
    const objectTosend = {
      file: [
        {
          base64: `data:image/jpeg;base64,${base64}`,
        },
      ],
    };
    try {
      const response: any = await fileUpload(objectTosend);
      if (response.url) {
        const objectToPhoto = {
          CriminalRecord: response.url,
        };
        try {
          const photoSave: any = await updatePreRegistration(id, objectToPhoto);
          console.log(photoSave, 'photoSave');
        } catch (error) {
          console.log(error, ' error');
        }
      }
    } catch (error) {
      console.log(error, ' error');
    }
    navigation.navigate('Bank');
  };

  function again() {
    navigation.navigate('CamCriminal');
  }
  return (
    <Container>
      <ConfirmCriminal
        again={again}
        submit={submit}
        goBack={handleGoBack}
        uri={uri}
      />
    </Container>
  );
};

export default Confirm;
