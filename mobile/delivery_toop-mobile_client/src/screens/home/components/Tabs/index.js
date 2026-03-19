/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {setCategory} from '../../../../store/actions/tab';

/** Styles */
import styles from './styles';

const Tabs = ({}) => {
  const dispatch = useDispatch();
  const {
    tab: {category = 'delivery'},
  } = useSelector(state => state);

  const [listTabs, setListTabs] = useState();
  const [itemSelected, setItemSelected] = useState({});

  const tabs = [
    {
      _id: 'delivery',
      name: 'Delivery',
    },
    {
      _id: 'service',
      name: 'Serviços',
    },
    {
      _id: 'drive',
      name: 'Drive',
    },
    // {
    //    _id: '3',
    //    name: 'Entrega',
    // },
  ];

  useEffect(() => {
    setListTabs(tabs);
    setItemSelected(tabs.find(item => item._id === category));
    return () => {};
  }, [category]);

  const clickSelectItem = item => {
    dispatch(setCategory(item._id));
    setItemSelected(item);
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.content}
        data={listTabs}
        keyExtractor={item => `${item._id}`}
        horizontal={true}
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.listContent}
            onPress={() => clickSelectItem(item)}>
            <Text
              style={[
                styles.titileTabs,
                item._id === itemSelected?._id ? styles.titleSelected : null,
              ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Tabs;
