import TrackPlayer from 'react-native-track-player';

export const startSoundNotification = async () => {
  try {
    TrackPlayer.setupPlayer()
      .then(async () => {
        await TrackPlayer.add({
          id: 'trackId',
          url: require('../../assets/mp3/sound_notification.mp3'),
          title: 'Notificação Novo Pedido',
          artist: 'Toop Comerciante',
        });

        // await TrackPlayer.add({
        //   id: 'trackId',
        //   url: require('../../assets/mp3/sound_notification.mp3'),
        //   title: 'Notificação Novo Pedido',
        // });

        await TrackPlayer.setVolume(1);
        TrackPlayer.play();
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
          id: 'trackId',
          url: require('../../assets/mp3/sound_notification.mp3'),
          title: 'Notificação Novo Serviço',
          artist: 'Toop Comerciante',
        });

        await TrackPlayer.setVolume(1);
        TrackPlayer.play();
      })
      .catch((err) => {
        console.log('Falhou ao Iniciar o Player', err);
      });
  } catch (err) {}
};
