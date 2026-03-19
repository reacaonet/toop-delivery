import React from 'react';

import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import {useTranslation} from 'react-i18next';

import {Typography, Colors} from '../../../../styles';
import {
  styles,
  Area,
  Contain,
  ViewText,
  TextTitle,
  Title,
  ContainIndex,
} from './styles';

import History from './history';

import DropDownPicker from 'react-native-dropdown-picker';
import {useNavigation} from '@react-navigation/native';

const HistoryRunning = () => {
  const {t} = useTranslation();

  const [text, setText] = React.useState('');
  const [showTheThing, setShowTheThing] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(null);
  const [items, setItems] = React.useState([
    {label: 'Apple', value: 'apple'},
    {label: 'Banana', value: 'banana'},
    ,
  ]);

  const navigation = useNavigation();

  return (
    <ContainIndex>
      {/*  Header */}
      <Area>
        <TouchableOpacity onPress={() => navigation.navigate('Email')}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Title>{t('races')}</Title>
      </Area>

      {/* BODY */}

      {/* CONTAINER 1 */}
      <Contain>
        <ViewText>
          <TextTitle>Anteriores</TextTitle>
          <TouchableOpacity onPress={() => setShowTheThing(!showTheThing)}>
            <Icon2 name="caretdown" size={20} style={styles.icon} />
          </TouchableOpacity>
        </ViewText>
      </Contain>

      {showTheThing && (
        <DropDownPicker
          containerStyle={{
            backgroundColor: '#e2e2e2',
            width: '90%',
            alignSelf: 'center',
            zIndex: 999,
          }}
          style={{
            backgroundColor: '#e2e2e2',
            width: '100%',
            alignSelf: 'center',
          }}
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
        />
      )}

      <FlatList
        data={[{title: 'Title Text', key: 'item1'}]}
        style={{marginBottom: 5, marginTop: 10}}
        renderItem={() => <History />}
      />
    </ContainIndex>
  );
};

export default HistoryRunning;
