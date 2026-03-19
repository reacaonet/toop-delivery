import React, { useState } from 'react';
import { Pressable, View, Text, StyleSheet, Modal, Alert } from 'react-native';
import { Typography, Colors } from '../../../styles';
import Info from './info';
import Message from './message';

function App({ nav }: { nav: any }) {
  const [color, setColor] = useState(Colors.BLACK);
  const [text, setText] = useState(Colors.GRAY_LIGHT);
  const [text2, setText2] = useState(Colors.BLACK);
  const [color2, setColor2] = useState(Colors.GRAY_LIGHT);
  const [showTheThing, setShowTheThing] = useState(true);
  const [show, setShow] = useState(false);

  function clicou() {
    setColor('black');
    setText(Colors.GRAY_LIGHT);
    setText2(Colors.BLACK);
    setColor2(Colors.GRAY_LIGHT);
    setShowTheThing(true);
    setShow(false);
  }

  function clicou2() {
    setColor2('black');
    setColor(Colors.GRAY_LIGHT);
    setText(Colors.BLACK);
    setText2(Colors.GRAY_LIGHT);
    setShowTheThing(false);
    setShow(true);
  }

  return (
    <View>
      <View style={styles.container}>
        <Pressable
          onPress={clicou}
          style={{ width: '50%', backgroundColor: color }}>
          <View>
            <Text
              style={{
                marginTop: 15,
                textAlign: 'center',
                color: text,
              }}>
              Informativos
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={clicou2}
          style={{ width: '50%', backgroundColor: color2 }}>
          <View>
            <Text
              style={{
                marginTop: 15,
                textAlign: 'center',
                color: text2,
              }}>
              Conversas
            </Text>
          </View>
        </Pressable>
      </View>

      {showTheThing && <Info />}

      {show && <Message nav={nav} />}
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 50,
    backgroundColor: Colors.GRAY_LIGHT,
    borderBottomColor: Colors.BLACK,
    borderBottomWidth: 1,
  },
  route1: {
    width: '50%',
  },
  route2: {
    width: '50%',
  },

  text2: {
    marginTop: 15,
    textAlign: 'center',
  },
});
