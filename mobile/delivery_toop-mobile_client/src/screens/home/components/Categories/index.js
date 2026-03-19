import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  View,
  FlatList,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';

/** Services */
import {StorageGet} from '../../../../services/deviceStorage';
import {listSegments} from '../../../../services/service/company/listSegments';

import styles from './styles';

const Categories = ({category}) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState(null);
  const [noResults, setNoResults] = useState(false);

  const pages = [
    {
      name: 'Mercados',
      page: 'Supermarket',
      screen: 'Supermarket',
    },
    {
      name: 'Restaurantes',
      page: 'Restaurant',
      screen: 'Restaurant',
    },
  ];

  useEffect(() => {
    const getList = async () => {
      try {
        let respAddress = await StorageGet('@addressUser');

        if (!respAddress?.location || !respAddress.location?.coordinates) {
          return;
        }

        const resp = await listSegments(
          respAddress.location.coordinates[1],
          respAddress.location.coordinates[0],
          {
            category: category,
          },
        );

        if (!resp) {
          setList(null);
          return setNoResults(true);
        }

        setList(resp);
      } catch (err) {
        console.log('fail getList', err);
      }
    };

    getList();
  }, [category]);

  const getScreenAndGo = segment => {
    return navigation.navigate('Shopping', {
      screen: 'CompanySegment',
      params: {
        segment: segment,
      },
    });
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return loading ? null : (
    <View style={styles.container}>
      {noResults ? (
        <View>
          <Text style={styles.txtTitle}>Segmentos não cadastrados ...</Text>
        </View>
      ) : null}

      {list && list.length > 0 ? (
        <View style={styles.content}>
          {/* <Text style={styles.txtTitle}>Categorias</Text> */}
          <FlatList
            data={list}
            style={styles.Flatlist}
            keyExtractor={item => item._id}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => getScreenAndGo(item)}
                style={styles.BoxFilter}>
                <FastImage
                  source={{
                    uri: item.images[0],
                    priority: FastImage.priority.high,
                  }}
                  style={[styles.Slide]}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <Text style={styles.FilterText} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}
    </View>
  );
};

export default Categories;
