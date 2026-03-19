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
import { Typography, Colors } from '../../../../styles';
import styles from './styles';
import History from './history';
import DropDownPicker from 'react-native-dropdown-picker';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

interface Props {
  goBack: any;
  plus: any;
}

const HistoryRunning: React.FC<Props> = ({ goBack, plus }) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState('');
  const [showTheThing, setShowTheThing] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(null);
  const [items, setItems] = React.useState([
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      {/*  Header */}
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="navigate-before" size={40} style={styles.iconGoBack} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('races')}</Text>
      </SafeAreaView>

      {/* BODY */}

      {/* CONTAINER 1 */}
      {/* <View style={styles.container}>
        <View style={styles.text}>
          <Text style={styles.title2}>Anteriores</Text>
          <TouchableOpacity onPress={() => setShowTheThing(!showTheThing)}>
            <Icon2 name="caretdown" size={20} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View> */}

      {showTheThing && (
        <DropDownPicker
          containerStyle={{
            backgroundColor: Colors.GRADIENTE_GREY_BOX,
            width: '90%',
            alignSelf: 'center',
          }}
          style={{
            backgroundColor: Colors.GRADIENTE_GREY_BOX,
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
        data={[{ title: 'Title Text', key: 'item1' }]}
        style={{ marginBottom: 5, marginTop: 10 }}
        renderItem={() => <History plus={plus} />}
      />
    </View>
  );
};

export default HistoryRunning;
