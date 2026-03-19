import React, {useEffect, useState, useCallback} from 'react';

import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';

import {
  monitorLocation,
  cleanMonitorLocation,
} from '../../store/actions/location';

import Search from './components/Search';
import Companys from './components/Companys';

import {
  styles,
  Container,
  ViewHeader,
  TextHeader,
  ScrollView,
  RefreshControl,
} from './Styles';

const Supermarket = ({navigation, onLocation, onCleanLocation}) => {
  const [refreshing, setRefreshing] = useState(false);

  const wait = timeout => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    wait(2000).then(async () => {
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    onLocation();

    return () => {
      onCleanLocation();
    };
  }, [onCleanLocation, onLocation]);

  return (
    <Container>
      <ViewHeader>
        <Icon
          name="navigate-before"
          size={45}
          style={styles.icon}
          onPress={() => navigation.navigate('Home')}
        />
        <TextHeader>MERCADO</TextHeader>
      </ViewHeader>
      <Search />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Companys refreshing={refreshing} />
      </ScrollView>
    </Container>
  );
};

const mapStateToProps = ({location}) => {
  return {
    coords: location.coords,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLocation: () => dispatch(monitorLocation()),
    onCleanLocation: () => dispatch(cleanMonitorLocation()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Supermarket);
