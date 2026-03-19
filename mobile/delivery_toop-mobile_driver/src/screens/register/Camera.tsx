import {
  requestCameraPermission,
  requestReadPermission,
  requestExternalWritePermission,
} from './../../services/permissions';
import * as ImagePicker from 'react-native-image-picker';

const pickFile = async (
  type: 'gallery' | 'camera',
  mediaType: 'photo' | 'video' | 'mixed',
): Promise<{ uri?: string; base64?: string }> => {
  let isReadStoragePermitted = await requestReadPermission();
  let isCameraPermitted = await requestCameraPermission();
  let isStoragePermitted = await requestExternalWritePermission();

  return new Promise(resolve => {
    try {
      if (isCameraPermitted && isStoragePermitted && isReadStoragePermitted) {
        if (type === 'gallery') {
          ImagePicker.launchImageLibrary(
            {
              mediaType,
              includeBase64: false,
              quality: 0.7,
              maxWidth: 800,
              maxHeight: 600,
              selectionLimit: 1,
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
              includeBase64: false,
              quality: 0.7,
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
      return resolve(ret);
    }
  });
};

const getResponse = (response: any): any => {
  if (response.didCancel) {
    return { error: true, code: -5, message: 'User cancelled camera picker' };
  } else if (response.errorCode === 'camera_unavailable') {
    return { error: true, code: -4, message: 'Camera not available on device' };
  } else if (response.errorCode === 'permission') {
    return { error: true, code: -3, message: 'Permission not satisfied' };
  } else if (response.errorCode === 'others') {
    return { error: true, code: -2, message: response.errorMessage };
  }

  if (
    response &&
    response.assets &&
    Array.isArray(response.assets) &&
    response.assets.length > 0
  ) {
    return {
      type: response?.assets[0]?.type,
      uri: response?.assets[0]?.uri,
      base64: response?.assets[0]?.base64,
      size: response?.assets[0]?.fileSize,
      name: response?.assets[0]?.fileName,
    };
  } else if (response && response?.uri) {
    return {
      type: response?.type,
      uri: response?.uri,
      base64: response?.base64,
      size: response?.fileSize,
      name: response?.fileName,
    };
  }

  return {
    uri: undefined,
  };
};

export default pickFile;

interface iFileGallery {
  type?: string;
  uri?: string;
  base64?: string;
  name?: string;
  size?: string;
}
