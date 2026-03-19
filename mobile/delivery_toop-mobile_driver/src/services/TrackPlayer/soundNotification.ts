import TrackPlayer from 'react-native-track-player';

export const startSoundNotification = async () => {
  try {
    try {
      await TrackPlayer.setupPlayer();
    } catch (err) {}

    await TrackPlayer.reset();

    const music: any = {
      url: require('../../assets/mp3/alert.mp3'),
      title: 'Notificação Nova Corrida',
      artist: 'App Motorista',
    };

    await TrackPlayer.add(music);

    await TrackPlayer.setVolume(1);
    await TrackPlayer.play();
    // await TrackPlayer.setRepeatMode(RepeatMode.Queue);
  } catch (err) {}
};

export const startSoundWhenBookingIsCanceled = async () => {
  try {
    const music: any = {
      url: require('../../assets/mp3/canceled.mp3'),
      title: 'Notificação de Corrida Cancelada',
      artist: 'App Motorista',
    };

    try {
      await TrackPlayer.setupPlayer();
    } catch (err) {}

    await TrackPlayer.reset();
    await TrackPlayer.add(music);
    await TrackPlayer.add(music);

    await TrackPlayer.setVolume(1);
    TrackPlayer.play();
  } catch (err) {}
};

export const startNewRace = async () => {
  try {
    try {
      await TrackPlayer.setupPlayer();
    } catch (err) {}

    const music: any = {
      url: require('../../assets/mp3/alert.mp3'),
      title: 'Notificação Nova Corrida',
      artist: 'App Motorista',
    };

    await TrackPlayer.reset();
    await TrackPlayer.add(music);
    await TrackPlayer.setVolume(1);
    TrackPlayer.play();
  } catch (err) {}
};

export const stopSound = async () => {
  try {
    await TrackPlayer.reset();
  } catch (err) {
    //
  }
};

export const onRegisterPlayback = async () => {
  // TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  // TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  // TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
};
