import DocumentPicker from 'react-native-document-picker';

import {
  requestExternalWritePermission,
  requestReadPermission,
} from './../../services/permissions';

const pickDocument = async () => {
  try {
    const isStoragePermitted = await requestExternalWritePermission();
    const isReadPermitted = await requestReadPermission();

    if (!isStoragePermitted || !isReadPermitted) {
      return null;
    }

    let res: any = await DocumentPicker.pick({
      type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
    });

    if (res && Array.isArray(res) && res.length > 0) {
      res = res[0];
    }

    // console.log('URI : ' + res.uri);
    // console.log('Type : ' + res.type);
    // console.log('File Name : ' + res.name);
    // console.log('File Size : ' + res.size);

    return res;
  } catch (err: any) {
    console.log('pickDocument', err.message);
    return null;
  }
};

export default pickDocument;
