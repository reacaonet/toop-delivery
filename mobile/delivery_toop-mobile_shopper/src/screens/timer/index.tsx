import React, {useState} from 'react';
import {FlatList} from 'react-native';
import {Container} from './styles';

import TimerComp from './timer';

interface Props {
  navigation: any;
}

const Timer = ({navigation}: Props) => {
  return (
    <Container>
      <FlatList
        data={[{title: 'Title Text', key: 'item1'}]}
        style={{marginBottom: 5, marginTop: 10}}
        renderItem={() => <TimerComp />}
      />
    </Container>
  );
};

export default Timer;
