import {Text, View, TouchableOpacity} from 'react-native';
import {styles, Container} from './styles';
import React, {FunctionComponent} from 'react';
import NetInfo from '@react-native-community/netinfo';

type ConnectivityProps = {
  navigation: any;
};

const Connectivity: FunctionComponent<ConnectivityProps> = ({
  navigation,
}: ConnectivityProps) => {
  const checkConnectivity = () => {
    console.log('Entrou');
    NetInfo.fetch().then((state) => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      if (state.isConnected) {
        navigation.navigate('Home', {screen: 'Home'});
      }
    });
  };

  return (
    <Container>
      <View style={styles.container}>
        <Text style={styles.title}>Ooops</Text>
        <Text style={styles.description}>
          Parece que você esta sem conexão com a internet!
        </Text>
        <TouchableOpacity onPress={() => checkConnectivity()}>
          <Text style={styles.link}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
};

export default Connectivity;
