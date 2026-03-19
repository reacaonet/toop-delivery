import React, {useState, FunctionComponent} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {Colors, Typography} from '../../styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  StorageGet,
  StorageSet,
  StorageClean,
} from '../../services/deviceStorage';

import {sendImages} from '../../services/provider/sendImages';

type TakePicturesProps = {
  navigation: any;
  route: any;
};

interface AtualPicture {
  uri: string;
  file: string;
}

const TakePictures: FunctionComponent<TakePicturesProps> = ({
  navigation,
  route: Route,
}: TakePicturesProps) => {
  const [loading, setLoading] = useState(false);
  const [camera, setCamera] = useState(null);
  const [flashMode, setFlashMode] = useState('flash-auto');
  const [atualPicture, setAtualPicture] = useState<AtualPicture | null>(null);
  const [instructionPicture, setInstructionPicture] = useState('');
  const [type, setType] = useState(() => {
    if (Route.params.type === 'cnh') {
      setInstructionPicture('Frente da CNH');
    }

    if (Route.params.type === 'documents') {
      setInstructionPicture('Frente do RG');
    }

    if (Route.params.type === 'selfie') {
      setInstructionPicture(
        `Tire uma ${type === 'selfie' ? 'selfie' : 'foto'}`,
      );
    }

    return Route.params.type ?? '';
  });

  const [quantityDocuments, setQuantityDocuments] = useState(() => {
    return Route.params.quantityDocuments ?? 2;
  });

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const takePicture = async () => {
    if (camera) {
      const options = {quality: 0.5, base64: true};
      const data = await camera.takePictureAsync(options);

      if (!data.uri) {
        return;
      }

      const mimeType = getMimeType(data.base64);
      const file = `data:${mimeType};base64, ${data.base64}`;
      const uri: string = data.uri ?? '';

      setInstructionPicture('Carregando');
      setLoading(true);

      const image = await sendImages(file, 'register_deliveryman');

      if (!image.data) {
        Alert.alert(
          'Oops',
          'Ocorreu um erro ao tirar sua foto, tente novamente.',
        );
        return;
      }

      setAtualPicture(image.data);
    }
  };

  const getMimeType = (imageFile: string) => {
    if (imageFile.charAt(0) === '/') {
      return 'image/jpeg';
    } else if (imageFile.charAt(0) === 'R') {
      return 'image/gif';
    } else if (imageFile.charAt(0) === 'i') {
      return 'image/png';
    }
  };

  const updateListPictures = async () => {
    if (!atualPicture) {
      return [];
    }

    const pictures: AtualPicture[] | null = await StorageGet('Pictures');

    let newListPictures: AtualPicture[] | null;
    if (pictures && pictures.length > 0) {
      newListPictures = [...pictures, atualPicture];
    } else {
      newListPictures = [atualPicture];
    }

    await StorageSet('Pictures', newListPictures);

    return newListPictures;
  };

  const goValidadePictures = async () => {
    const pictures: AtualPicture[] | null = await updateListPictures();

    if (type === 'cnh' && pictures && pictures.length === 1) {
      setInstructionPicture('Verso da CNH');
      setAtualPicture(null);
      setLoading(false);
      return;
    }

    if (
      type === 'documents' &&
      pictures &&
      pictures.length < quantityDocuments
    ) {
      if (pictures.length === 1) {
        setInstructionPicture('Verso do RG');
      }

      if (pictures.length === 2) {
        setInstructionPicture('Frente do CPF');
      }

      if (pictures.length === 3) {
        setInstructionPicture('Verso do CPF');
      }

      setAtualPicture(null);
      setLoading(false);
      return;
    }

    await StorageClean('Pictures');
    navigation.navigate('ValidadePictures', {
      screen: 'ValidadePictures',
      pictures,
      type,
    });
  };

  const getFlashMode = () => {
    if (flashMode === 'flash-on') {
      return RNCamera.Constants.FlashMode.on;
    }

    if (flashMode === 'flash-off') {
      return RNCamera.Constants.FlashMode.off;
    }

    if (flashMode === 'flash-auto') {
      return RNCamera.Constants.FlashMode.auto;
    }

    return RNCamera.Constants.FlashMode.auto;
  };

  const alterFlashMode = () => {
    if (flashMode === 'flash-on') {
      setFlashMode('flash-off');
    }

    if (flashMode === 'flash-off') {
      setFlashMode('flash-auto');
    }

    if (flashMode === 'flash-auto') {
      setFlashMode('flash-on');
    }
  };

  const getTypeCam = () => {
    if (type === 'selfie') {
      return RNCamera.Constants.Type.front;
    }

    return RNCamera.Constants.Type.back;
  };

  const takeOtherPicture = () => {
    setAtualPicture(null);
    setLoading(false);

    if (type === 'cnh') {
      setInstructionPicture('Frente da CNH');
    }

    if (type === 'documents') {
      setInstructionPicture('Frente do RG');
    }

    if (type === 'selfie') {
      setInstructionPicture(
        `Tire uma ${type === 'selfie' ? 'selfie' : 'foto'}`,
      );
    }
  };

  return (
    <View style={styles.container}>
      {atualPicture ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image
            source={{uri: atualPicture}}
            style={{width: width, height: height}}
          />
        </View>
      ) : (
        <RNCamera
          ref={(ref) => {
            setCamera(ref);
          }}
          captureAudio={false}
          style={styles.preview}
          type={getTypeCam()}
          flashMode={getFlashMode()}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}>
          <View style={styles.allItens}>
            <View style={styles.viewStatusFlash}>
              <TouchableOpacity
                onPress={() => alterFlashMode()}
                style={styles.statusFlash}>
                <Icon name={flashMode} size={30} color={Colors.PRIMARY} />
              </TouchableOpacity>
            </View>
            {!loading && (
              <View style={styles.viewTakePicture}>
                <TouchableOpacity
                  onPress={() => takePicture()}
                  style={styles.takePicture}>
                  <Icon name="camera" size={60} color={Colors.PRIMARY} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </RNCamera>
      )}

      <View
        style={{
          flex: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor: Colors.PRIMARY,
        }}>
        {atualPicture ? (
          <>
            <TouchableOpacity
              onPress={() => takeOtherPicture()}
              style={styles.capture}>
              <Text style={{fontSize: 14}}> Tirar outra foto </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => goValidadePictures()}
              style={styles.capture}>
              <Text style={{fontSize: 14}}> Continuar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.viewInstructions}>
            <Text style={styles.textPicture}>{instructionPicture}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    flexDirection: 'column',
  },
  capture: {
    borderRadius: 5,
    backgroundColor: Colors.WHITE,
    flex: 0,
    padding: 15,
    paddingHorizontal: 20,
    margin: 20,
    width: '40%',
    alignItems: 'center',
  },
  textPicture: {
    color: Colors.WHITE,
    fontSize: 25,
    fontFamily: Typography.FONT_FAMILY_BOLD,
  },
  statusFlash: {
    marginRight: 20,
  },
  viewStatusFlash: {
    marginTop: 60,
    alignItems: 'flex-end',
  },
  takePicture: {
    marginBottom: 20,
  },
  viewTakePicture: {
    alignItems: 'center',
  },
  allItens: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  viewInstructions: {
    padding: 15,
    paddingHorizontal: 20,
    margin: 20,
  },
});

export default TakePictures;
