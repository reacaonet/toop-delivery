import api from '../../api';

const checkVersion = async (currentVersin, platform) => {
  try {
    const response = await api.get(
      `/setting/app-versions/check?version=${currentVersin}&platform=${platform}`,
    );
    const data = response.data;
    return data;
  } catch (err) {
    console.log('Fail App Version Settings', err);
    return {};
  }
};

export {checkVersion};
