/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';

/** Service */
import {listFilter} from '../../../../services/service/Filter';
import {StorageGet} from '../../../../services/deviceStorage';

/** Styles */
import styles from './styles';

const RestaurantCategory = ({companyCategory}) => {
  const navigation = useNavigation();
  const [dataFilter, setDataFilter] = useState([]);
  const [category, setCategory] = useState(null);
  const [topFilter, setTopFilter] = useState(null);

  const getData = async () => {
    let respAddress = await StorageGet('@addressUser');

    if (!respAddress?.location || !respAddress.location?.coordinates) {
      return;
    }

    listFilter({
      companyCategory: companyCategory,
      latitude: respAddress.location.coordinates[1],
      longitude: respAddress.location.coordinates[0],
      showHome: true,
      showInApp: true,
    }).then(result => {
      if (result && Array.isArray(result) && result.length > 0) {
        setDataFilter(result);
      } else {
        setDataFilter([]);
      }
    });
  };

  useEffect(() => {
    getData();
  }, [companyCategory]);

  const setFilter = async (item, filterTop) => {
    return navigation.navigate('Shopping', {
      screen: 'CompanySegment',
      params: {
        segment: item?.segment,
        category: item.keyword || item.name,
        topFilter: true,
      },
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dataFilter}
        style={styles.Flatlist}
        keyExtractor={item => item._id}
        showsHorizontalScrollIndicator={false}
        horizontal
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => setFilter(item, true)}
            style={styles.BoxFilter}>
            <FastImage
              source={{
                uri: item.images[0],
                priority: FastImage.priority.normal,
              }}
              style={[
                styles.Slide,
                category !== item.keyword && topFilter ? styles.imgGrey : null,
              ]}
              resizeMode={FastImage.resizeMode.cover}
            />
            <Text style={styles.FilterText} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default RestaurantCategory;
