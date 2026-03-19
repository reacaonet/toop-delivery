import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Colors} from '../../../../styles';
import {styles, Container, TextSearch, TouchSearch, TouchBox} from './Styles';

const Search = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const seacharView = () => {
    navigation.navigate('Search', {
      screen: 'Search',
      params: {},
    });
  };

  return (
    <Container>
      <TouchBox onPress={() => seacharView()}>
        <TouchSearch onPress={() => seacharView()}>
          <Icon name="search" size={30} style={styles.icon} />
        </TouchSearch>
        <TextSearch
          placeholderTextColor={Colors.DARK}
          autoCapitalize="none"
          placeholder="Buscar"
          returnKeyType="search"
          onChangeText={setSearch}
          value={search}
          pointerEvents={'none'}
          onFocus={() => seacharView()}
        />
      </TouchBox>
    </Container>
  );
};

export default Search;
