import React from 'react';
import { FlatList } from 'react-native';
import { Container } from './styles';

/** Components */
import HistoryRun from './components/screenName';

interface Props {
  navigation: any;
}

const ViewHistory = ({ navigation }: Props) => {
  function handleGoBack() {
    navigation.navigate('Gain');
  }

  function submit() {
    navigation.navigate('Email');
  }

  function go() {
    navigation.navigate('DetailGain');
  }

  return <HistoryRun goBack={handleGoBack} go={go} />;
};

export default ViewHistory;
