import React, { useState, FunctionComponent } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RNCamera } from 'react-native-camera';
import { Colors, Typography } from '../../../../styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

type TakePicturesProps = {
  navigation: any;
  route: any;
};

interface AtualPicture {
  uri: string;
  file: string;
}

const TakePictures: FunctionComponent<TakePicturesProps> = ({ navigation }) => {
  const route = useRoute<any>();

  const [camera, setCamera] = useState<any>();
  const [flashMode, setFlashMode] = useState('flash-auto');

  const takePicture = async () => {
    if (camera) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      navigation.navigate('ConfirmCrlv', {
        photo: data,
        car: route.params?.car || {},
      });
    }
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

  return (
    <View style={styles.container}>
      <RNCamera
        ref={ref => {
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
