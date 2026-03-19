import React from 'react';
import { FlatList } from 'react-native';
import { Container } from './styles';

/** Components */
import HistoryRunning from './components/screenName';

interface Props {
  navigation: any;
}

const ViewHistory = ({ navigation }: Props) => {
  function handleGoBack() {
    navigation.navigate('Home', {
      screen: 'Home',
      params: {},
    });
  }

  function plus(item: any) {
    navigation.navigate('Detail', {
      booking: item,
    });
  }

  return <HistoryRunning goBack={handleGoBack} plus={plus} />;
};

export default ViewHistory;
