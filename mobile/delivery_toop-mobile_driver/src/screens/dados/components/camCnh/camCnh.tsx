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
import {Colors, Typography} from '../../../../styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  StorageGet,
  StorageSet,
  StorageClean,
} from '../../../../services/deviceStorage';
import {requestCameraPermission} from '../../../../services/permissions/index'
import {sendImages} from '../../../../services/sendImages';

type TakePicturesProps = {
  navigation: any;
  route: any;
};

interface AtualPicture {
  uri: string;
  file: string;
}

const TakePictures: FunctionComponent<TakePicturesProps> = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [camera, setCamera] = useState();
  const [flashMode, setFlashMode] = useState('flash-auto');
  const [atualPicture, setAtualPicture] = useState<AtualPicture | null>(null);
  const [instructionPicture, setInstructionPicture] = useState('');
  const [type, setType] = useState()

  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  const takePicture = async () => {
    if (camera) {
      const options = {quality: 0.5, base64: true};
      const data = await camera.takePictureAsync(options);
      console.log(data.uri);
      navigation.navigate('ConfirmCn', {
        screen: 'ConfirmCn',
        params: {},
      });
  };
  }
/*   const getMimeType = (imageFile: string) => {
    if (imageFile.charAt(0) === '/') {
      return 'image/jpeg';
    } else if (imageFile.charAt(0) === 'R') {
      return 'image/gif';
    } else if (imageFile.charAt(0) === 'i') {
      return 'image/png';
    }
  }; */


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


/*   const takeOtherPicture = () => {
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
  }; */

  return (
    <View style={styles.container}>
      {/* {atualPicture ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image
            source={{uri: atualPicture}}
            style={{width: width, height: height}}
          />
        </View>
      ) : ( */}
        <RNCamera
          ref={(ref) => {
            setCamera(ref);
          }}
          captureAudio={false}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
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
           
              <View style={styles.viewTakePicture}>
                <TouchableOpacity
                  onPress={() => takePicture()}
                  style={styles.takePicture}>
                  <Icon name="camera" size={60} color={Colors.PRIMARY} />
                </TouchableOpacity>
              </View>
          
          </View>
        </RNCamera>
      

    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
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
