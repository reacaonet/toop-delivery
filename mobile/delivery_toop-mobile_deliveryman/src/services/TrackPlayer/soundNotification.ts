import TrackPlayer, {RepeatMode} from 'react-native-track-player';

export const startSoundNotification = async () => {
  try {
    await TrackPlayer.stop();

    TrackPlayer.setupPlayer()
      .then(async () => {
        await TrackPlayer.add({
          url: require('../../assets/mp3/alert.mp3'),
          title: 'Notificação Nova Corrida',
        });

        await TrackPlayer.add({
          url: require('../../assets/mp3/alert.mp3'),
          title: 'Notificação Nova Corrida',
        });

        await TrackPlayer.add({
          url: require('../../assets/mp3/alert.mp3'),
          title: 'Notificação Nova Corrida',
        });

        await TrackPlayer.add({
          url: require('../../assets/mp3/alert.mp3'),
          title: 'Notificação Nova Corrida',
        });

        await TrackPlayer.add({
          url: require('../../assets/mp3/alert.mp3'),
          title: 'Notificação Nova Corrida',
        });

        await TrackPlayer.add({
          url: require('../../assets/mp3/alert.mp3'),
          title: 'Notificação Nova Corrida',
        });

        await TrackPlayer.add({
          url: require('../../assets/mp3/alert.mp3'),
          title: 'Notificação Nova Corrida',
        });

        await TrackPlayer.setVolume(1);
        TrackPlayer.play();
        // TrackPlayer.setRepeatMode(RepeatMode.Queue);
      })
      .catch((err) => {
        console.log('Falhou ao Iniciar o Player', err);
      });
  } catch (err) {}
};

export const startNewRace = async () => {
  try {
    TrackPlayer.setupPlayer()
      .then(async () => {
        await TrackPlayer.add({
          url: require('../../assets/mp3/alert.mp3'),
          title: 'Notificação Nova Corrida',
        });

        await TrackPlayer.setVolume(1);
        TrackPlayer.play();
      })
      .catch((err) => {
        console.log('Falhou ao Iniciar o Player', err);
      });
  } catch (err) {}
};

export const stopSound = async () => {
  try {
    await TrackPlayer.stop();
  } catch (err) {
    //
  }
};
