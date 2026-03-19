import {
  requestCameraPermission,
  requestExternalWritePermission,
} from './../permissions';
import * as ImagePicker from 'react-native-image-picker';

const pickFile = async (
  type: 'gallery' | 'camera',
  mediaType: 'photo' | 'video' | 'mixed',
): Promise<{uri?: string, base64?: string}> => {
  let isCameraPermitted = await requestCameraPermission();
  let isStoragePermitted = await requestExternalWritePermission();

  return new Promise((resolve, reject) => {
    try {
      if (isCameraPermitted && isStoragePermitted) {
        if (type === 'gallery') {
          ImagePicker.launchImageLibrary(
            {
              mediaType: mediaType,
              includeBase64: true,
              quality: 0.5,
              maxWidth: 800,
              maxHeight: 600,
            },
            (response: any) => {
              const ret: iFileGallery = getResponse(response);

              return resolve(ret);
            },
          );
        } else {
          ImagePicker.launchCamera(
            {
              mediaType,
              saveToPhotos: false,
              cameraType: 'back',
              includeBase64: true,
              quality: 0.5,
              maxWidth: 800,
              maxHeight: 600,
            },
            (response: any) => {
              const ret: iFileGallery = getResponse(response);

              return resolve(ret);
            },
          );
        }
      } else {
        console.log('oii');
        const ret: iFileGallery | undefined = {
          uri: undefined,
        };

        return resolve(ret);
      }
    } catch (err) {
      console.warn('err => ', err);
      const ret: iFileGallery | undefined = {
        uri: undefined,
      };
      return reject(ret);
    }
  });
};

const getResponse = (response: any): any => {
  if (response.didCancel) {
    return {error: true, code: -5, message: 'User cancelled camera picker'};
  } else if (response.errorCode == 'camera_unavailable') {
    return {error: true, code: -4, message: 'Camera not available on device'};
  } else if (response.errorCode == 'permission') {
    return {error: true, code: -3, message: 'Permission not satisfied'};
  } else if (response.errorCode == 'others') {
    return {error: true, code: -2, message: response.errorMessage};
  }

  if (response && response.assets && response.assets.length > 0) {
    return {
      uri: response?.assets[0].uri,
      base64: response?.assets[0].base64,
    };
  } else if (response) {
    return {
      uri: response.uri,
      base64: response.base64,
    };
  }
};

export default pickFile;

interface iFileGallery {
  uri?: string;
  base64?: string;
}
