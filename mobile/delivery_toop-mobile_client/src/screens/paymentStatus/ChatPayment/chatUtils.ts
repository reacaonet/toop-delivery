import * as ImagePicker from 'react-native-image-picker';

import {
  requestReadPermission,
  requestCameraPermission,
  requestExternalWritePermission,
} from '../../../services/permissions';

const later = (delay: any) =>
  new Promise(resolve => {
    setTimeout(resolve, delay);
  });

const pickFile = async (
  type: 'gallery' | 'camera',
  mediaType: 'photo' | 'video' | 'mixed',
): Promise<{uri?: string; base64?: string; type?: string}> => {
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

// const launchImageLibrary = () => {
//   let options = {
//     storageOptions: {
//       skipBackup: true,
//       path: 'images',
//     },
//   };
//   ImagePicker.launchImageLibrary(options, response => {
//     // console.log('Response = ', response);

//     if (response.didCancel) {
//       // console.log('User cancelled image picker');
//     } else if (response.error) {
//       // console.log('ImagePicker Error: ', response.error);
//     } else if (response.customButton) {
//       // console.log('User tapped custom button: ', response.customButton);
//     } else {
//       const source = {uri: response.uri};
//       // console.log('Source', source);
//       // console.log('response', JSON.stringify(response));
//       /*
//       this.setState({
//         filePath: response,
//         fileData: response.data,
//         fileUri: response.uri,
//       });
//       */
//     }
//   });
// };

// const chooseImage = async () => {
//   let isCameraPermitted = await requestCameraPermission();
//   let isStoragePermitted = await requestExternalWritePermission();

//   return new Promise((resolve, reject) => {
//     try {
//       if (!isCameraPermitted || !isStoragePermitted) {
//         return reject({
//           type: 'ERR_ALL',
//           error: 'è preciso ativar as permissões de galeria e camera',
//         });
//       }

//       console.log('tirar foto aqui ...');

//       let options = {
//         title: 'Selecione uma Imagem',
//         takePhotoButtonTitle: 'Tirar uma Foto',
//         chooseFromLibraryButtonTitle: 'Abrir Galeria',
//         cancelButtonTitle: 'Cancelar',
//         quality: 0.5,
//         maxWidth: 500,
//         maxHeight: 500,
//         mediaType: 'photo',
//         storageOptions: {
//           skipBackup: true,
//           path: 'images',
//         },
//       };

//       ImagePicker.showImagePicker(options, response => {
//         console.log('showImagePicker response: ', response);

//         if (response.didCancel) {
//           return reject({
//             type: 'cancel',
//             message: 'User cancelled image picker',
//           });
//         } else if (response.error) {
//           return reject({type: 'error', message: response.error});
//         } else if (response.customButton) {
//           //console.log('User tapped custom button: ', response.customButton);
//         } else {
//           //const source = {uri: response.uri};
//           const source = {
//             uri: `data:${response.type};base64, ${response.data}`,
//           };

//           // You can also display the image using data:
//           // const source = { uri: 'data:image/jpeg;base64,' + response.data };
//           // alert(JSON.stringify(response));
//           //console.log('response', JSON.stringify(response));

//           return resolve({
//             type: response.type,
//             source,
//           });
//         }
//       });
//     } catch (err) {
//       return reject({
//         type: 'ERR_ALL',
//         error: err,
//       });
//     }
//   });
// };

const SelectImage = () => {
  let options = {
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  ImagePicker.launchImageLibrary(options, response => {
    // console.log('Response = ', response);

    if (response.didCancel) {
      // console.log('User cancelled image picker');
    } else if (response.error) {
      // console.log('ImagePicker Error: ', response.error);
    } else if (response.customButton) {
      // console.log('User tapped custom button: ', response.customButton);
    } else {
      const source = {uri: response.uri};
      // console.log('Source', source);
      // console.log('response', JSON.stringify(response));
      /*
      this.setState({
        filePath: response,
        fileData: response.data,
        fileUri: response.uri,
      });
      */
    }
  });
};

// const TakeImage = async () => {
//   try {
//     let isReadStoragePermitted = await requestReadPermission();
//     let isCameraPermitted = await requestCameraPermission();
//     let isStoragePermitted = await requestExternalWritePermission();

//     return new Promise((resolve, reject) => {
//       try {
//         if (
//           !isReadStoragePermitted ||
//           !isCameraPermitted ||
//           !isStoragePermitted
//         ) {
//           return reject({
//             type: 'ERR_ALL',
//             error: 'è preciso ativar as permissões de galeria e camera',
//           });
//         }

//         let options = {
//           title: 'Selecione uma Imagem',
//           takePhotoButtonTitle: 'Tirar uma Foto',
//           chooseFromLibraryButtonTitle: 'Abrir Galeria',
//           cancelButtonTitle: 'Cancelar',
//           quality: 0.5,
//           maxWidth: 500,
//           maxHeight: 500,
//           mediaType: 'photo',
//           storageOptions: {
//             skipBackup: true,
//             path: 'images',
//           },
//         };

//         ImagePicker.showImagePicker(options, response => {
//           if (response.didCancel) {
//             return reject({
//               type: 'cancel',
//               message: 'User cancelled image picker',
//             });
//           }
//           if (response.error) {
//             return reject({type: 'error', message: response.error});
//           }
//           const source = {
//             uri: `data:image/jpeg;base64, ${response.data}`,
//           };

//           return resolve({
//             type: response.type,
//             source,
//           });
//         });
//       } catch (err) {
//         reject({
//           type: 'ERR_ALL',
//           error: err,
//         });
//       }
//     });
//   } catch (err) {
//     console.warn(err);
//   }
// };

const getResponse = (response: any): any => {
  if (response.didCancel) {
    return {error: true, code: -5, message: 'User cancelled camera picker'};
  } else if (response.errorCode === 'camera_unavailable') {
    return {error: true, code: -4, message: 'Camera not available on device'};
  } else if (response.errorCode === 'permission') {
    return {error: true, code: -3, message: 'Permission not satisfied'};
  } else if (response.errorCode === 'others') {
    return {error: true, code: -2, message: response.errorMessage};
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

export {pickFile, later, SelectImage};

interface iFileGallery {
  type?: string;
  uri?: string;
  base64?: string;
  name?: string;
  size?: string;
}
